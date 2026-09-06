-- Structural assertions run after the full migration chain. Any failure raises
-- and aborts the run (psql -v ON_ERROR_STOP=1).

DO $$
DECLARE
  missing TEXT;
BEGIN
  -- 1. Every expected table exists
  SELECT string_agg(t, ', ') INTO missing
  FROM unnest(ARRAY[
    'users','client_profiles','provider_profiles','inspector_profiles','provider_categories',
    'locations','service_categories','projects','project_files','quotations','quotation_items',
    'project_provider_assignments','milestones','provider_evidence','inspection_assignments',
    'inspection_reports','inspector_evidence','payment_records','payment_disputes','reviews',
    'provider_reviews','notifications','audit_logs','user_feedback','analytics_events'
  ]) AS t
  WHERE to_regclass('public.' || t) IS NULL;
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'missing tables: %', missing;
  END IF;

  -- 2. No competing profiles table and no FK pointing at one
  IF to_regclass('public.profiles') IS NOT NULL THEN
    RAISE EXCEPTION 'public.profiles must not exist (public.users is canonical)';
  END IF;

  -- 3. Every expected function exists
  SELECT string_agg(f, ', ') INTO missing
  FROM unnest(ARRAY[
    'public.check_user_role(uuid,text)',
    'public.handle_new_auth_user()',
    'public.select_provider_for_project(uuid,uuid)',
    'public.approve_milestone_payment(uuid,uuid)',
    'public.complete_project(uuid,uuid)',
    'public.mark_payment_paid_idempotent(uuid,uuid,text,text,text)',
    'public.acknowledge_payment_receipt(uuid)',
    'public.is_project_client(uuid,uuid)',
    'public.is_project_provider(uuid,uuid)',
    'public.is_active_project_provider(uuid,uuid)',
    'public.is_project_inspector(uuid,uuid)',
    'public.is_milestone_inspector(uuid,uuid)',
    'public.is_report_inspector(uuid,uuid)',
    'public.milestone_project_id(uuid)',
    'public.report_project_id(uuid)',
    'public.storage_path_segment_uuid(text,integer)',
    'public.set_updated_at()',
    'public.guard_profile_protected_columns()',
    'public.trg_payment_records_derive_parties()',
    'public.audit_logs_immutable()'
  ]) AS f
  WHERE to_regprocedure(f) IS NULL;
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'missing functions: %', missing;
  END IF;

  -- 4. Canonical payment_records shape
  SELECT string_agg(c, ', ') INTO missing
  FROM unnest(ARRAY[
    'id','milestone_id','project_id','client_id','provider_id','amount','currency','status',
    'approved_at','paid_at','payment_method_label','external_reference','client_note',
    'provider_acknowledged_at','recorded_by_user_id','reference_no','notes','created_at','updated_at'
  ]) AS c
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payment_records' AND column_name = c
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'payment_records missing columns: %', missing;
  END IF;

  -- 5. projects.updated_at exists (complete_project depends on it)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'updated_at'
  ) THEN
    RAISE EXCEPTION 'projects.updated_at missing';
  END IF;

  -- 6. Required views
  SELECT string_agg(v, ', ') INTO missing
  FROM unnest(ARRAY['public_job_listings','provider_directory','provider_inspection_feedback','project_private_details']) AS v
  WHERE to_regclass('public.' || v) IS NULL;
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'missing views: %', missing;
  END IF;

  -- 7. Provider-facing views must not expose private columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_inspection_feedback' AND column_name = 'summary_notes'
  ) THEN
    RAISE EXCEPTION 'provider_inspection_feedback exposes summary_notes';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_directory' AND column_name IN ('email','phone_e164')
  ) THEN
    RAISE EXCEPTION 'provider_directory exposes contact details';
  END IF;

  -- 8. Required unique indexes
  SELECT string_agg(i, ', ') INTO missing
  FROM unnest(ARRAY[
    'uq_payment_records_milestone','uq_milestones_project_order',
    'uq_client_profiles_user','uq_provider_profiles_user','uq_inspector_profiles_user',
    'idx_unique_active_project_assignment','idx_unique_accepted_quotation_per_project',
    'idx_unique_active_inspection_assignment'
  ]) AS i
  WHERE NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = i);
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'missing indexes: %', missing;
  END IF;

  -- 9. Every RLS-enabled table has at least one policy, except the deprecated
  --    reviews table which is intentionally locked.
  SELECT string_agg(c.relname, ', ') INTO missing
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    AND c.relname <> 'reviews'
    AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname);
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'RLS enabled without policies: %', missing;
  END IF;

  -- 10. Every application table has RLS enabled (lookup tables excepted)
  SELECT string_agg(c.relname, ', ') INTO missing
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
    AND c.relname NOT IN ('locations', 'service_categories');
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'tables without RLS: %', missing;
  END IF;

  -- 11. Auth trigger wired
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relname = 'users' AND t.tgname = 'on_auth_user_created'
  ) THEN
    RAISE EXCEPTION 'auth.users trigger on_auth_user_created missing';
  END IF;

  -- 12. Storage policies present for every private bucket
  SELECT string_agg(b, ', ') INTO missing
  FROM unnest(ARRAY['provider-evidence','inspector-evidence','project-documents','provider-portfolios']) AS b
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'storage' AND p.tablename = 'objects'
      AND (COALESCE(p.qual, '') LIKE '%' || b || '%' OR COALESCE(p.with_check, '') LIKE '%' || b || '%')
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'storage buckets without policies: %', missing;
  END IF;

  -- 13. Privileged functions are not executable by anon / PUBLIC
  SELECT string_agg(f, ', ') INTO missing
  FROM unnest(ARRAY[
    'public.approve_milestone_payment(uuid,uuid)',
    'public.complete_project(uuid,uuid)',
    'public.mark_payment_paid_idempotent(uuid,uuid,text,text,text)',
    'public.acknowledge_payment_receipt(uuid)',
    'public.select_provider_for_project(uuid,uuid)',
    'public.handle_new_auth_user()'
  ]) AS f
  WHERE has_function_privilege('anon', f, 'EXECUTE');
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'anon can execute privileged functions: %', missing;
  END IF;

  -- 14. No API role holds TRUNCATE on any public table
  SELECT string_agg(relname, ', ') INTO missing
  FROM (
    SELECT c.oid, c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  ) t
  WHERE has_table_privilege('authenticated', t.oid, 'TRUNCATE')
     OR has_table_privilege('anon', t.oid, 'TRUNCATE');
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'API roles hold TRUNCATE on: %', missing;
  END IF;

  RAISE NOTICE 'schema integrity: all 14 checks passed';
END $$;
