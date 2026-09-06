#!/usr/bin/env bash
# Applies every migration in supabase/migrations against a brand-new local
# PostgreSQL database, in filename order, each inside ON_ERROR_STOP so the first
# failure aborts with a non-zero exit code. Then runs the RLS security matrix.
#
# Usage: PGPORT=54329 supabase/tests/run_fresh_migration_test.sh
# Requires: initdb, pg_ctl, psql on PATH (PostgreSQL 15+).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MIGRATIONS_DIR="$ROOT/supabase/migrations"
TESTS_DIR="$ROOT/supabase/tests"
PGPORT="${PGPORT:-54329}"
PGDATA="${PGDATA:-/tmp/kuvakahub-pg-$PGPORT}"
DBNAME="kuvakahub_migration_test"
export PGHOST=/tmp PGUSER=postgres PGPORT

cleanup() {
  if [ -f "$PGDATA/postmaster.pid" ]; then
    pg_ctl -D "$PGDATA" stop -m immediate -s >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

rm -rf "$PGDATA"
initdb -D "$PGDATA" -U postgres --auth=trust >/dev/null
pg_ctl -D "$PGDATA" -o "-p $PGPORT -k /tmp -c listen_addresses=''" -l "$PGDATA/server.log" start -s -w

psql -qtA -d postgres -c "DROP DATABASE IF EXISTS $DBNAME" >/dev/null
psql -qtA -d postgres -c "CREATE DATABASE $DBNAME" >/dev/null

echo "== applying platform shim"
psql -q -v ON_ERROR_STOP=1 -d "$DBNAME" -f "$TESTS_DIR/00_supabase_shim.sql"

echo "== applying migrations in order"
for f in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  echo "-- $(basename "$f")"
  psql -q -v ON_ERROR_STOP=1 -d "$DBNAME" -f "$f"
done

echo "== schema integrity checks"
psql -q -v ON_ERROR_STOP=1 -d "$DBNAME" -f "$TESTS_DIR/10_schema_integrity.sql"

echo "== RLS security matrix"
psql -q -v ON_ERROR_STOP=1 -d "$DBNAME" -f "$TESTS_DIR/20_security_matrix.sql"

echo "== ALL PASSED"
