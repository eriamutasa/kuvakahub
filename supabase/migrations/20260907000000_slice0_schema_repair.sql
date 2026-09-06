-- ============================================================================
-- KUVAKAHUB SLICE 0: SCHEMA REPAIR FOR PRODUCTION MIGRATION
-- ============================================================================
-- Scope: make the Phase 1 / Phase 4 / Phase 5 schema internally consistent and
-- safe for Slice 1 (real Supabase Auth). Additive only:
--   * no DROP TABLE, no DROP COLUMN, no data mutation
--   * policy replacements (DROP POLICY + CREATE POLICY) only tighten access or
--     remove recursive policy definitions that PostgreSQL rejects at query time
--   * CREATE OR REPLACE FUNCTION keeps existing signatures so later app code
--     does not have to change call sites
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. ROLE + RELATIONSHIP HELPERS
--    SECURITY DEFINER so policies can consult related tables without hitting
--    RLS recursion (projects <-> assignments <-> quotations ...). Each helper
--    returns only a boolean / id, never row data.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_user_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_user_id AND u.role::text = p_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_client(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT p_project_id IS NOT NULL AND p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.projects WHERE id = p_project_id AND client_id = p_user_id
  );
$$;

-- Provider currently or previously awarded the project (ACTIVE or COMPLETED).
CREATE OR REPLACE FUNCTION public.is_project_provider(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT p_project_id IS NOT NULL AND p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.project_provider_assignments
    WHERE project_id = p_project_id AND provider_id = p_user_id AND status IN ('ACTIVE', 'COMPLETED')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_project_provider(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT p_project_id IS NOT NULL AND p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.project_provider_assignments
    WHERE project_id = p_project_id AND provider_id = p_user_id AND status = 'ACTIVE'
  );
$$;

-- Inspector with a non-cancelled assignment on any milestone of the project.
CREATE OR REPLACE FUNCTION public.is_project_inspector(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT p_project_id IS NOT NULL AND p_user_id IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.inspection_assignments ia
    JOIN public.milestones m ON m.id = ia.milestone_id
    WHERE m.project_id = p_project_id AND ia.inspector_id = p_user_id AND ia.status <> 'CANCELLED'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_milestone_inspector(p_milestone_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT p_milestone_id IS NOT NULL AND p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.inspection_assignments
    WHERE milestone_id = p_milestone_id AND inspector_id = p_user_id AND status <> 'CANCELLED'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_report_inspector(p_report_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT p_report_id IS NOT NULL AND p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.inspection_reports WHERE id = p_report_id AND inspector_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.milestone_project_id(p_milestone_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT project_id FROM public.milestones WHERE id = p_milestone_id;
$$;

CREATE OR REPLACE FUNCTION public.report_project_id(p_report_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT m.project_id
  FROM public.inspection_reports r
  JOIN public.milestones m ON m.id = r.milestone_id
  WHERE r.id = p_report_id;
$$;

-- Safe UUID extraction from a storage object path segment (1-based).
-- Returns NULL instead of raising when the path is malformed, so a bad path
-- simply fails the policy rather than erroring the request.
CREATE OR REPLACE FUNCTION public.storage_path_segment_uuid(p_name TEXT, p_index INT)
RETURNS UUID LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  parts TEXT[];
  seg TEXT;
BEGIN
  parts := string_to_array(p_name, '/');
  IF parts IS NULL OR p_index < 1 OR array_length(parts, 1) < p_index THEN
    RETURN NULL;
  END IF;
  seg := parts[p_index];
  IF seg ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN seg::uuid;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Helpers are evaluated inside policies for anon and authenticated sessions.
REVOKE EXECUTE ON FUNCTION public.check_user_role(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_project_client(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_project_provider(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_active_project_provider(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_project_inspector(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_milestone_inspector(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_report_inspector(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.milestone_project_id(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.report_project_id(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.storage_path_segment_uuid(TEXT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_user_role(UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_project_client(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_project_provider(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_active_project_provider(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_project_inspector(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_milestone_inspector(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_report_inspector(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.milestone_project_id(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.report_project_id(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.storage_path_segment_uuid(TEXT, INT) TO anon, authenticated, service_role;


-- ----------------------------------------------------------------------------
-- 1. CANONICAL USER TABLE: public.users
--    auth.users INSERT -> trigger -> public.users row.
--    Public signup may only produce CLIENT or PROVIDER. ADMIN and INSPECTOR
--    rows are created/promoted exclusively by an ADMIN (or service role).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_requested TEXT;
  v_role      public.user_role;
  v_email     TEXT;
  v_name      TEXT;
BEGIN
  -- Role requested in signUp metadata is caller-controlled: whitelist only the
  -- two public self-registration roles, everything else becomes CLIENT.
  v_requested := upper(COALESCE(NEW.raw_user_meta_data ->> 'role', ''));
  IF v_requested IN ('CLIENT', 'PROVIDER') THEN
    v_role := v_requested::public.user_role;
  ELSE
    v_role := 'CLIENT';
  END IF;

  v_email := COALESCE(NEW.email, NEW.phone, NEW.id::text || '@no-email.kuvakahub.local');
  v_name  := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')), '');
  IF v_name IS NULL THEN
    v_name := split_part(v_email, '@', 1);
  END IF;

  INSERT INTO public.users (id, email, phone_e164, role, full_name)
  VALUES (NEW.id, v_email, NEW.phone, v_role, v_name)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Phase 1 exposed every PROVIDER row (including email and phone) to all
-- authenticated users. Provider discovery now goes through the
-- provider_directory view (section 2), so users rows are private.
DROP POLICY IF EXISTS "Users view own or provider records" ON public.users;

CREATE POLICY "Users read own record" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins read all users" ON public.users
  FOR SELECT TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'));

-- Admin promotion path (CLIENT/PROVIDER -> INSPECTOR, etc.). Ordinary users
-- remain bound by the Phase 1 role-freeze UPDATE policy.
CREATE POLICY "Admins update users" ON public.users
  FOR UPDATE TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (public.check_user_role(auth.uid(), 'ADMIN'));

-- No INSERT policy on public.users on purpose: rows are created only by the
-- auth trigger (SECURITY DEFINER) or the service role.

-- One profile row per user.
CREATE UNIQUE INDEX IF NOT EXISTS uq_client_profiles_user    ON public.client_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_provider_profiles_user  ON public.provider_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_inspector_profiles_user ON public.inspector_profiles(user_id);


-- ----------------------------------------------------------------------------
-- 2. PROFILE TABLE RLS + PROTECTED COLUMNS + DISCOVERY VIEW
-- ----------------------------------------------------------------------------
-- verification_status and system-maintained metrics can only change when the
-- session is an ADMIN or a non-JWT context (service role / migrations).
CREATE OR REPLACE FUNCTION public.guard_profile_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.check_user_role(auth.uid(), 'ADMIN') THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'profile ownership cannot be reassigned';
  END IF;

  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    RAISE EXCEPTION 'verification_status can only be changed by an administrator';
  END IF;

  IF TG_TABLE_NAME = 'provider_profiles' THEN
    IF NEW.completed_projects_count IS DISTINCT FROM OLD.completed_projects_count
       OR NEW.avg_rating IS DISTINCT FROM OLD.avg_rating THEN
      RAISE EXCEPTION 'provider rating metrics are system maintained';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_profile_protected_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_provider_profile ON public.provider_profiles;
CREATE TRIGGER trg_guard_provider_profile
BEFORE UPDATE ON public.provider_profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_protected_columns();

DROP TRIGGER IF EXISTS trg_guard_inspector_profile ON public.inspector_profiles;
CREATE TRIGGER trg_guard_inspector_profile
BEFORE UPDATE ON public.inspector_profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_protected_columns();

-- client_profiles
CREATE POLICY "Client reads own profile" ON public.client_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.check_user_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Client creates own profile" ON public.client_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.check_user_role(auth.uid(), 'CLIENT'));

CREATE POLICY "Client updates own profile" ON public.client_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage client profiles" ON public.client_profiles
  FOR ALL TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (public.check_user_role(auth.uid(), 'ADMIN'));

-- provider_profiles
CREATE POLICY "Provider reads own profile" ON public.provider_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.check_user_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Provider creates own unverified profile" ON public.provider_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.check_user_role(auth.uid(), 'PROVIDER')
    AND verification_status = 'UNVERIFIED'
    AND completed_projects_count = 0
    AND avg_rating = 0
  );

CREATE POLICY "Provider updates own profile" ON public.provider_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage provider profiles" ON public.provider_profiles
  FOR ALL TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (public.check_user_role(auth.uid(), 'ADMIN'));

-- inspector_profiles (never self-registered)
CREATE POLICY "Inspector reads own profile" ON public.inspector_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.check_user_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Inspector updates own profile" ON public.inspector_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage inspector profiles" ON public.inspector_profiles
  FOR ALL TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (public.check_user_role(auth.uid(), 'ADMIN'));

-- provider_categories: public read, provider maintains own links
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider categories are public" ON public.provider_categories
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Provider manages own categories" ON public.provider_categories
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.provider_profiles pp WHERE pp.id = provider_id AND pp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.provider_profiles pp WHERE pp.id = provider_id AND pp.user_id = auth.uid()));

-- Public provider discovery: VERIFIED providers only, no email / phone.
-- Intentionally NOT security_invoker: runs as the view owner so anon and
-- authenticated sessions can read it while provider_profiles/users stay private.
CREATE OR REPLACE VIEW public.provider_directory AS
SELECT
  pp.id                       AS provider_profile_id,
  pp.user_id,
  u.full_name,
  u.avatar_url,
  pp.business_name,
  pp.bio,
  pp.experience_years,
  pp.operating_radius_km,
  pp.verification_status,
  pp.completed_projects_count,
  pp.avg_rating,
  l.city,
  l.suburb,
  COALESCE(
    (SELECT array_agg(sc.slug ORDER BY sc.slug)
     FROM public.provider_categories pc
     JOIN public.service_categories sc ON sc.id = pc.category_id
     WHERE pc.provider_id = pp.id),
    '{}'::text[]
  ) AS category_slugs
FROM public.provider_profiles pp
JOIN public.users u ON u.id = pp.user_id
LEFT JOIN public.locations l ON l.id = pp.location_id
WHERE pp.verification_status = 'VERIFIED';

ALTER VIEW public.provider_directory SET (security_invoker = false);
REVOKE ALL ON public.provider_directory FROM PUBLIC;
GRANT SELECT ON public.provider_directory TO anon, authenticated, service_role;


-- ----------------------------------------------------------------------------
-- 3. PROJECTS / QUOTATIONS / ASSIGNMENTS: remove recursive policies
--    Phase 1 policies referenced each other's RLS-protected tables directly,
--    which PostgreSQL rejects with "infinite recursion detected in policy".
-- ----------------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Client reads own projects" ON public.projects;
CREATE POLICY "Projects visible to owner marketplace assigned parties admin" ON public.projects
  FOR SELECT
  USING (
    client_id = auth.uid()
    OR (status = 'OPEN_FOR_QUOTATIONS' AND visibility = 'MARKETPLACE')
    OR public.is_project_provider(id, auth.uid())
    OR public.is_project_inspector(id, auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

-- Phase 1 column-restricted projects for anon only; authenticated sessions
-- could still read address_private / budget_estimate of every marketplace
-- row. Restrict at the column level and expose the private fields through a
-- relationship-checked view instead.
REVOKE SELECT ON public.projects FROM authenticated;
GRANT SELECT (id, client_id, title, category_id, location_id, status, visibility,
              preferred_timeframe, description, created_at, updated_at)
  ON public.projects TO authenticated;

CREATE OR REPLACE VIEW public.project_private_details AS
SELECT
  p.id AS project_id,
  p.address_private,
  p.budget_estimate
FROM public.projects p
WHERE public.is_project_client(p.id, auth.uid())
   OR public.is_project_provider(p.id, auth.uid())
   OR public.check_user_role(auth.uid(), 'ADMIN');

ALTER VIEW public.project_private_details SET (security_invoker = false);
REVOKE ALL ON public.project_private_details FROM PUBLIC, anon;
GRANT SELECT ON public.project_private_details TO authenticated, service_role;

DROP POLICY IF EXISTS "Read quotes secrecy" ON public.quotations;
CREATE POLICY "Quotations visible to project client own provider admin" ON public.quotations
  FOR SELECT TO authenticated
  USING (
    public.is_project_client(project_id, auth.uid())
    OR provider_id = auth.uid()
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

DROP POLICY IF EXISTS "Assignments read by client provider admin" ON public.project_provider_assignments;
CREATE POLICY "Assignments visible to provider client admin" ON public.project_provider_assignments
  FOR SELECT TO authenticated
  USING (
    provider_id = auth.uid()
    OR public.is_project_client(project_id, auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

-- quotation_items: parent-consistent secrecy (Slice 3 will use these as-is)
CREATE POLICY "Quotation items visible to own provider project client admin" ON public.quotation_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_items.quotation_id
        AND (q.provider_id = auth.uid() OR public.is_project_client(q.project_id, auth.uid()))
    )
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Provider inserts items on own quotation" ON public.quotation_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_items.quotation_id
        AND q.provider_id = auth.uid()
        AND q.status IN ('DRAFT', 'SUBMITTED')
    )
  );

CREATE POLICY "Provider updates items on own quotation" ON public.quotation_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_items.quotation_id
        AND q.provider_id = auth.uid()
        AND q.status IN ('DRAFT', 'SUBMITTED')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_items.quotation_id
        AND q.provider_id = auth.uid()
        AND q.status IN ('DRAFT', 'SUBMITTED')
    )
  );

CREATE POLICY "Provider deletes items on own quotation" ON public.quotation_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_items.quotation_id
        AND q.provider_id = auth.uid()
        AND q.status IN ('DRAFT', 'SUBMITTED')
    )
  );

CREATE POLICY "Admins manage quotation items" ON public.quotation_items
  FOR ALL TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (public.check_user_role(auth.uid(), 'ADMIN'));

-- project_files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project files visible to project parties" ON public.project_files
  FOR SELECT TO authenticated
  USING (
    public.is_project_client(project_id, auth.uid())
    OR public.is_project_provider(project_id, auth.uid())
    OR public.is_project_inspector(project_id, auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Project client uploads project files" ON public.project_files
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by_user_id = auth.uid() AND public.is_project_client(project_id, auth.uid()));

CREATE POLICY "Project client deletes own project files" ON public.project_files
  FOR DELETE TO authenticated
  USING (public.is_project_client(project_id, auth.uid()) OR public.check_user_role(auth.uid(), 'ADMIN'));


-- ----------------------------------------------------------------------------
-- 4. MILESTONES
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_milestones_project_order ON public.milestones(project_id, order_index);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Milestones visible to project parties" ON public.milestones
  FOR SELECT TO authenticated
  USING (
    public.is_project_client(project_id, auth.uid())
    OR public.is_project_provider(project_id, auth.uid())
    OR public.is_milestone_inspector(id, auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Project client creates milestones" ON public.milestones
  FOR INSERT TO authenticated
  WITH CHECK (public.is_project_client(project_id, auth.uid()) OR public.check_user_role(auth.uid(), 'ADMIN'));

-- Provider / inspector status transitions are deliberately NOT granted here;
-- they will arrive as state-machine RPCs in the milestone slice.
CREATE POLICY "Project client updates milestones" ON public.milestones
  FOR UPDATE TO authenticated
  USING (public.is_project_client(project_id, auth.uid()) OR public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (public.is_project_client(project_id, auth.uid()) OR public.check_user_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Project client deletes unstarted milestones" ON public.milestones
  FOR DELETE TO authenticated
  USING (
    (public.is_project_client(project_id, auth.uid()) AND status = 'NOT_STARTED')
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );


-- ----------------------------------------------------------------------------
-- 5. PAYMENT RECORDS: one canonical shape
--    Phase 1 columns : id, milestone_id, status(payment_status), amount,
--                      recorded_by_user_id, reference_no, notes, updated_at
--    Phase 4 (added) : project_id, client_id, provider_id, currency, approved_at,
--                      paid_at, payment_method_label, external_reference,
--                      client_note, provider_acknowledged_at, created_at
--    Slice 0         : milestone uniqueness, party derivation, updated_at
--                      maintenance, direct-write lockdown (RPC only).
-- ----------------------------------------------------------------------------
-- Intended Phase 4 workflow never supplies recorded_by_user_id; derive it.
ALTER TABLE public.payment_records ALTER COLUMN recorded_by_user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_records_milestone ON public.payment_records(milestone_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);

CREATE OR REPLACE FUNCTION public.trg_payment_records_derive_parties()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  SELECT m.project_id, p.client_id
  INTO NEW.project_id, NEW.client_id
  FROM public.milestones m
  JOIN public.projects p ON p.id = m.project_id
  WHERE m.id = NEW.milestone_id;

  IF NEW.project_id IS NULL THEN
    RAISE EXCEPTION 'payment_records.milestone_id % does not resolve to a project', NEW.milestone_id;
  END IF;

  SELECT provider_id
  INTO NEW.provider_id
  FROM public.project_provider_assignments
  WHERE project_id = NEW.project_id AND status IN ('ACTIVE', 'COMPLETED')
  ORDER BY (status = 'ACTIVE') DESC, assigned_at DESC
  LIMIT 1;

  IF NEW.recorded_by_user_id IS NULL THEN
    NEW.recorded_by_user_id := auth.uid();
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trg_payment_records_derive_parties() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_payment_records_derive_parties ON public.payment_records;
CREATE TRIGGER trg_payment_records_derive_parties
BEFORE INSERT OR UPDATE OF milestone_id ON public.payment_records
FOR EACH ROW EXECUTE FUNCTION public.trg_payment_records_derive_parties();

DROP TRIGGER IF EXISTS trg_payment_records_updated_at ON public.payment_records;
CREATE TRIGGER trg_payment_records_updated_at
BEFORE UPDATE ON public.payment_records
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Money state changes only through the SECURITY DEFINER RPCs below. The Phase 4
-- UPDATE policies remain but have no columns they can reach.
REVOKE INSERT, UPDATE, DELETE ON public.payment_records FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_payment_disputes_updated_at ON public.payment_disputes;
CREATE TRIGGER trg_payment_disputes_updated_at
BEFORE UPDATE ON public.payment_disputes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_provider_reviews_updated_at ON public.provider_reviews;
CREATE TRIGGER trg_provider_reviews_updated_at
BEFORE UPDATE ON public.provider_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 6. PAYMENT / COMPLETION RPCs: identity from auth.uid(), never from params
--    Signatures are unchanged; p_client_id is retained for compatibility and
--    is validated against auth.uid() rather than trusted.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_milestone_payment(
  p_milestone_id UUID,
  p_client_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller     UUID := auth.uid();
  v_ms         public.milestones%ROWTYPE;
  v_owner      UUID;
  v_record_id  UUID;
  v_status     public.payment_status;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_client_id IS NOT NULL AND p_client_id <> v_caller THEN
    RAISE EXCEPTION 'Caller identity mismatch';
  END IF;

  SELECT * INTO v_ms FROM public.milestones WHERE id = p_milestone_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Milestone not found';
  END IF;

  SELECT client_id INTO v_owner FROM public.projects WHERE id = v_ms.project_id;
  IF v_owner IS DISTINCT FROM v_caller THEN
    RAISE EXCEPTION 'Unauthorized: caller does not own this project';
  END IF;

  IF v_ms.status <> 'CLIENT_APPROVED' THEN
    RAISE EXCEPTION 'Milestone must be CLIENT_APPROVED before payment approval';
  END IF;

  SELECT id, status INTO v_record_id, v_status
  FROM public.payment_records WHERE milestone_id = p_milestone_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.payment_records (milestone_id, amount, status, approved_at, recorded_by_user_id)
    VALUES (p_milestone_id, v_ms.amount, 'APPROVED', NOW(), v_caller)
    RETURNING id INTO v_record_id;
  ELSE
    IF v_status IN ('APPROVED', 'PAID') THEN
      RETURN TRUE; -- idempotent
    END IF;
    IF v_status = 'DISPUTED' THEN
      RAISE EXCEPTION 'Payment is under dispute';
    END IF;
    UPDATE public.payment_records
    SET status = 'APPROVED', approved_at = NOW()
    WHERE id = v_record_id;
  END IF;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller, 'PAYMENT_APPROVED', 'PaymentRecord', v_record_id,
          jsonb_build_object('milestoneId', p_milestone_id, 'projectId', v_ms.project_id));

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_project(
  p_project_id UUID,
  p_client_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller     UUID := auth.uid();
  v_unapproved INT;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_client_id IS NOT NULL AND p_client_id <> v_caller THEN
    RAISE EXCEPTION 'Caller identity mismatch';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_project_id AND client_id = v_caller AND status = 'ACTIVE'
    FOR UPDATE
  ) THEN
    RAISE EXCEPTION 'Project not active or unauthorized client';
  END IF;

  SELECT COUNT(*) INTO v_unapproved
  FROM public.milestones
  WHERE project_id = p_project_id AND status <> 'CLIENT_APPROVED';

  IF v_unapproved > 0 THEN
    RAISE EXCEPTION 'Cannot complete project with unapproved milestones (% remaining)', v_unapproved;
  END IF;

  UPDATE public.projects SET status = 'COMPLETED' WHERE id = p_project_id;

  -- Close the engagement so the assignment history is truthful. The review
  -- INSERT policy (section 9) accepts ACTIVE or COMPLETED assignments.
  UPDATE public.project_provider_assignments
  SET status = 'COMPLETED'
  WHERE project_id = p_project_id AND status = 'ACTIVE';

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller, 'PROJECT_COMPLETED', 'Project', p_project_id, '{}'::jsonb);

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_payment_paid_idempotent(
  p_milestone_id UUID,
  p_client_id UUID,
  p_method_label TEXT,
  p_external_ref TEXT,
  p_client_note TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_record public.payment_records%ROWTYPE;
  v_owner  UUID;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_client_id IS NOT NULL AND p_client_id <> v_caller THEN
    RAISE EXCEPTION 'Caller identity mismatch';
  END IF;

  SELECT * INTO v_record FROM public.payment_records
  WHERE milestone_id = p_milestone_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found';
  END IF;

  -- Ownership from the project, not from the (possibly null) denormalised column.
  SELECT p.client_id INTO v_owner
  FROM public.milestones m JOIN public.projects p ON p.id = m.project_id
  WHERE m.id = p_milestone_id;

  IF v_owner IS DISTINCT FROM v_caller THEN
    RAISE EXCEPTION 'Unauthorized: caller does not own this project';
  END IF;

  IF v_record.status = 'PAID' THEN
    RETURN TRUE; -- idempotent
  END IF;

  IF v_record.status NOT IN ('APPROVED', 'PENDING_APPROVAL') THEN
    RAISE EXCEPTION 'Invalid payment state transition from % to PAID', v_record.status;
  END IF;

  UPDATE public.payment_records
  SET status               = 'PAID',
      paid_at              = NOW(),
      payment_method_label = p_method_label,
      external_reference   = p_external_ref,
      client_note          = p_client_note
  WHERE id = v_record.id;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller, 'PAYMENT_MARKED_PAID', 'PaymentRecord', v_record.id,
          jsonb_build_object('milestoneId', p_milestone_id, 'method', p_method_label));

  RETURN TRUE;
END;
$$;

-- Provider-side receipt confirmation (the only provider write on payment_records).
CREATE OR REPLACE FUNCTION public.acknowledge_payment_receipt(p_milestone_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_record public.payment_records%ROWTYPE;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_record FROM public.payment_records
  WHERE milestone_id = p_milestone_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found';
  END IF;

  IF NOT public.is_project_provider(v_record.project_id, v_caller) THEN
    RAISE EXCEPTION 'Unauthorized: caller is not the assigned provider';
  END IF;

  IF v_record.status <> 'PAID' THEN
    RAISE EXCEPTION 'Payment has not been marked as paid';
  END IF;

  IF v_record.provider_acknowledged_at IS NOT NULL THEN
    RETURN TRUE; -- idempotent
  END IF;

  UPDATE public.payment_records
  SET provider_acknowledged_at = NOW()
  WHERE id = v_record.id;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller, 'PAYMENT_RECEIPT_ACKNOWLEDGED', 'PaymentRecord', v_record.id,
          jsonb_build_object('milestoneId', p_milestone_id));

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_milestone_payment(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.complete_project(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_payment_paid_idempotent(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.acknowledge_payment_receipt(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.approve_milestone_payment(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_project(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_payment_paid_idempotent(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.acknowledge_payment_receipt(UUID) TO authenticated, service_role;


-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS: strictly owner-scoped, read-state only
-- ----------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only is_read is directly writable; platform notifications are inserted by
-- SECURITY DEFINER functions (e.g. select_provider_for_project) or the service role.
REVOKE INSERT, UPDATE, DELETE ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;


-- ----------------------------------------------------------------------------
-- 8. INSPECTIONS: provider must never read summary_notes or raw inspector evidence
-- ----------------------------------------------------------------------------
-- inspection_assignments
ALTER TABLE public.inspection_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inspection assignments visible to project parties" ON public.inspection_assignments
  FOR SELECT TO authenticated
  USING (
    inspector_id = auth.uid()
    OR public.is_project_client(public.milestone_project_id(milestone_id), auth.uid())
    OR public.is_project_provider(public.milestone_project_id(milestone_id), auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Admins create inspection assignments" ON public.inspection_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.check_user_role(auth.uid(), 'ADMIN')
    AND assigned_by_admin_id = auth.uid()
    AND public.check_user_role(inspector_id, 'INSPECTOR')
  );

CREATE POLICY "Admin or assigned inspector updates assignment" ON public.inspection_assignments
  FOR UPDATE TO authenticated
  USING (inspector_id = auth.uid() OR public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (inspector_id = auth.uid() OR public.check_user_role(auth.uid(), 'ADMIN'));

-- Inspector may only move status / schedule; reassignment is admin-only via full grant path later.
REVOKE UPDATE ON public.inspection_assignments FROM PUBLIC, anon, authenticated;
GRANT UPDATE (status, scheduled_date, completed_at) ON public.inspection_assignments TO authenticated;

-- inspection_reports (base table: inspector, client, admin only)
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inspection reports visible to inspector client admin" ON public.inspection_reports
  FOR SELECT TO authenticated
  USING (
    inspector_id = auth.uid()
    OR public.is_project_client(public.milestone_project_id(milestone_id), auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Assigned inspector submits report" ON public.inspection_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    inspector_id = auth.uid()
    AND public.check_user_role(auth.uid(), 'INSPECTOR')
    AND public.is_milestone_inspector(milestone_id, auth.uid())
    AND (
      assignment_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.inspection_assignments ia
        WHERE ia.id = assignment_id AND ia.milestone_id = inspection_reports.milestone_id AND ia.inspector_id = auth.uid()
      )
    )
  );

-- Reports are immutable for everyone except admins.
CREATE POLICY "Admins manage inspection reports" ON public.inspection_reports
  FOR UPDATE TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'))
  WITH CHECK (public.check_user_role(auth.uid(), 'ADMIN'));

-- Provider-facing projection: result + provider_feedback only. Runs as owner so
-- the base-table policy (which excludes providers) is not applied; the WHERE
-- clause restricts rows to the assigned provider's own projects.
CREATE OR REPLACE VIEW public.provider_inspection_feedback AS
SELECT
  r.id,
  r.milestone_id,
  m.project_id,
  r.result,
  r.provider_feedback,
  r.created_at
FROM public.inspection_reports r
JOIN public.milestones m ON m.id = r.milestone_id
WHERE public.is_project_provider(m.project_id, auth.uid());

ALTER VIEW public.provider_inspection_feedback SET (security_invoker = false);
REVOKE ALL ON public.provider_inspection_feedback FROM PUBLIC, anon;
GRANT SELECT ON public.provider_inspection_feedback TO authenticated, service_role;

-- inspector_evidence: tighten Phase 1 policies (no recursion, must be report author)
DROP POLICY IF EXISTS "Inspector evidence read restricted" ON public.inspector_evidence;
CREATE POLICY "Inspector evidence visible to uploader client admin" ON public.inspector_evidence
  FOR SELECT TO authenticated
  USING (
    uploaded_by_user_id = auth.uid()
    OR public.is_project_client(public.report_project_id(report_id), auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

DROP POLICY IF EXISTS "Assigned inspector uploads evidence" ON public.inspector_evidence;
CREATE POLICY "Report author uploads inspector evidence" ON public.inspector_evidence
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by_user_id = auth.uid()
    AND public.check_user_role(auth.uid(), 'INSPECTOR')
    AND public.is_report_inspector(report_id, auth.uid())
  );

-- provider_evidence (RLS was enabled in Phase 1 with no policies)
CREATE POLICY "Provider evidence visible to project parties" ON public.provider_evidence
  FOR SELECT TO authenticated
  USING (
    uploaded_by_user_id = auth.uid()
    OR public.is_project_client(public.milestone_project_id(milestone_id), auth.uid())
    OR public.is_milestone_inspector(milestone_id, auth.uid())
    OR public.check_user_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Active provider uploads milestone evidence" ON public.provider_evidence
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by_user_id = auth.uid()
    AND public.is_active_project_provider(public.milestone_project_id(milestone_id), auth.uid())
  );


-- ----------------------------------------------------------------------------
-- 9. REVIEWS: provider_reviews is canonical; public.reviews is deprecated
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.reviews IS
  'DEPRECATED (Slice 0): superseded by public.provider_reviews. Locked by RLS with no policies. Do not write. Scheduled for removal after Slice 6 once provider_reviews is live.';
COMMENT ON TABLE public.provider_reviews IS
  'Canonical verified provider review table (one review per project, by the project client).';

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reviews FROM PUBLIC, anon, authenticated;

-- Phase 4 required the assignment to still be ACTIVE, but complete_project now
-- closes it as COMPLETED. Accept either so a legitimate post-completion review works.
DROP POLICY IF EXISTS "Clients can insert review for completed owned projects" ON public.provider_reviews;
CREATE POLICY "Clients can insert review for completed owned projects" ON public.provider_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = provider_reviews.project_id AND p.client_id = auth.uid() AND p.status = 'COMPLETED'
    )
    AND EXISTS (
      SELECT 1 FROM public.project_provider_assignments ppa
      WHERE ppa.project_id = provider_reviews.project_id
        AND ppa.provider_id = provider_reviews.provider_id
        AND ppa.status IN ('ACTIVE', 'COMPLETED')
    )
  );


-- ----------------------------------------------------------------------------
-- 10. AUDIT LOGS: append-only, admin-readable
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.check_user_role(auth.uid(), 'ADMIN'));

-- Writes only via SECURITY DEFINER functions / service role.
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.audit_logs_immutable()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.audit_logs_immutable() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.audit_logs_immutable();


-- TRUNCATE is not subject to RLS; API roles must never hold it.
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;


-- ----------------------------------------------------------------------------
-- 11. STORAGE POLICIES (buckets created in Phase 1)
--     Path conventions (already used by the app's evidence records):
--       provider-evidence  : projects/{projectId}/milestones/{milestoneId}/provider/{file}
--       inspector-evidence : projects/{projectId}/milestones/{milestoneId}/inspector/{file}
--       project-documents  : projects/{projectId}/{...}
--       provider-portfolios: providers/{userId}/{file}
-- ----------------------------------------------------------------------------
-- provider-evidence
CREATE POLICY "Active provider uploads provider evidence" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'provider-evidence'
    AND public.is_active_project_provider(public.storage_path_segment_uuid(name, 2), auth.uid())
    AND public.milestone_project_id(public.storage_path_segment_uuid(name, 4)) = public.storage_path_segment_uuid(name, 2)
  );

CREATE POLICY "Project parties read provider evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'provider-evidence'
    AND (
      public.is_project_client(public.storage_path_segment_uuid(name, 2), auth.uid())
      OR public.is_project_provider(public.storage_path_segment_uuid(name, 2), auth.uid())
      OR public.is_project_inspector(public.storage_path_segment_uuid(name, 2), auth.uid())
      OR public.check_user_role(auth.uid(), 'ADMIN')
    )
  );

-- inspector-evidence (provider deliberately excluded)
CREATE POLICY "Assigned inspector uploads inspector evidence" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'inspector-evidence'
    AND public.is_milestone_inspector(public.storage_path_segment_uuid(name, 4), auth.uid())
    AND public.milestone_project_id(public.storage_path_segment_uuid(name, 4)) = public.storage_path_segment_uuid(name, 2)
  );

CREATE POLICY "Client inspector admin read inspector evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'inspector-evidence'
    AND (
      public.is_project_client(public.storage_path_segment_uuid(name, 2), auth.uid())
      OR public.is_milestone_inspector(public.storage_path_segment_uuid(name, 4), auth.uid())
      OR public.check_user_role(auth.uid(), 'ADMIN')
    )
  );

-- project-documents
CREATE POLICY "Project client uploads project documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-documents'
    AND public.is_project_client(public.storage_path_segment_uuid(name, 2), auth.uid())
  );

CREATE POLICY "Project parties read project documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND (
      public.is_project_client(public.storage_path_segment_uuid(name, 2), auth.uid())
      OR public.is_project_provider(public.storage_path_segment_uuid(name, 2), auth.uid())
      OR public.is_project_inspector(public.storage_path_segment_uuid(name, 2), auth.uid())
      OR public.check_user_role(auth.uid(), 'ADMIN')
    )
  );

CREATE POLICY "Project client deletes project documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND public.is_project_client(public.storage_path_segment_uuid(name, 2), auth.uid())
  );

-- provider-portfolios (public bucket)
CREATE POLICY "Anyone reads provider portfolios" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'provider-portfolios');

CREATE POLICY "Provider manages own portfolio objects" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'provider-portfolios'
    AND public.storage_path_segment_uuid(name, 2) = auth.uid()
    AND public.check_user_role(auth.uid(), 'PROVIDER')
  )
  WITH CHECK (
    bucket_id = 'provider-portfolios'
    AND public.storage_path_segment_uuid(name, 2) = auth.uid()
    AND public.check_user_role(auth.uid(), 'PROVIDER')
  );
