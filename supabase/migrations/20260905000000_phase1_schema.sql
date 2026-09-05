-- Complete Hardened Database Schema Migration for KuvakaHub
-- Database: Supabase PostgreSQL

-- 1. Create Custom Enum Types
CREATE TYPE user_role AS ENUM ('CLIENT', 'PROVIDER', 'INSPECTOR', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE project_status AS ENUM ('DRAFT', 'OPEN_FOR_QUOTATIONS', 'PROVIDER_SELECTED', 'ACTIVE', 'AWAITING_VERIFICATION', 'AWAITING_CLIENT_APPROVAL', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE quotation_status AS ENUM ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE item_type AS ENUM ('LABOUR', 'MATERIAL');
CREATE TYPE milestone_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PROVIDER_SUBMITTED', 'INSPECTION_REQUIRED', 'INSPECTOR_VERIFIED', 'NEEDS_ATTENTION', 'CLIENT_APPROVED', 'REJECTED');
CREATE TYPE inspection_assignment_status AS ENUM ('ASSIGNED', 'ACCEPTED', 'VISIT_REQUIRED', 'SUBMITTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE inspection_result AS ENUM ('VERIFIED', 'NEEDS_ATTENTION', 'REJECTED');
CREATE TYPE payment_status AS ENUM ('NOT_DUE', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'DISPUTED');
CREATE TYPE media_type AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');
CREATE TYPE assignment_status AS ENUM ('ACTIVE', 'COMPLETED', 'TERMINATED');

-- 2. Core Tables
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone_e164 TEXT,
  role user_role NOT NULL DEFAULT 'CLIENT',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  diaspora_country TEXT,
  target_city TEXT DEFAULT 'Chinhoyi',
  preferred_contact TEXT DEFAULT 'WHATSAPP'
);

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL DEFAULT 'Zimbabwe',
  province TEXT NOT NULL DEFAULT 'Mashonaland West',
  city TEXT NOT NULL,
  suburb TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT
);

CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  operating_radius_km INT DEFAULT 50,
  bio TEXT,
  experience_years INT DEFAULT 0,
  verification_status verification_status DEFAULT 'UNVERIFIED',
  completed_projects_count INT DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0.00
);

CREATE TABLE public.provider_categories (
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, category_id)
);

CREATE TABLE public.inspector_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id),
  qualifications TEXT,
  verification_status verification_status DEFAULT 'UNVERIFIED'
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  budget_estimate NUMERIC(12,2),
  status project_status NOT NULL DEFAULT 'DRAFT',
  visibility TEXT NOT NULL DEFAULT 'MARKETPLACE',
  preferred_timeframe TEXT DEFAULT 'Within 2 weeks',
  description TEXT NOT NULL,
  address_private TEXT, -- Strictly private property address
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  media_type media_type NOT NULL,
  file_size INT,
  mime_type TEXT,
  uploaded_by_user_id UUID NOT NULL REFERENCES public.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.users(id),
  labor_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (labor_subtotal >= 0),
  material_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (material_subtotal >= 0),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  est_duration_days INT CHECK (est_duration_days > 0),
  proposed_start_date DATE,
  status quotation_status NOT NULL DEFAULT 'SUBMITTED',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HARDENED LINE TOTAL INTEGRITY: Enforce quantity >= 0, unit_price >= 0, and line_total = quantity * unit_price
CREATE TABLE public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  item_type item_type NOT NULL,
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(12,2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE public.project_provider_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.users(id),
  accepted_quotation_id UUID NOT NULL REFERENCES public.quotations(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status assignment_status NOT NULL DEFAULT 'ACTIVE'
);

-- DATABASE UNIQUENESS INVARIANTS
-- Invariant 1: Only ONE active provider assignment per project
CREATE UNIQUE INDEX idx_unique_active_project_assignment 
  ON public.project_provider_assignments (project_id) 
  WHERE status = 'ACTIVE';

-- Invariant 2: Only ONE accepted quotation per project
CREATE UNIQUE INDEX idx_unique_accepted_quotation_per_project 
  ON public.quotations (project_id) 
  WHERE status = 'ACCEPTED';

CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status milestone_status NOT NULL DEFAULT 'NOT_STARTED',
  due_date DATE
);

CREATE TABLE public.provider_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES public.users(id),
  storage_path TEXT NOT NULL,
  media_type media_type NOT NULL,
  notes TEXT,
  file_size INT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.inspection_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES public.users(id),
  assigned_by_admin_id UUID NOT NULL REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_date DATE,
  status inspection_assignment_status NOT NULL DEFAULT 'ASSIGNED',
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.inspection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES public.users(id),
  assignment_id UUID REFERENCES public.inspection_assignments(id),
  result inspection_result NOT NULL,
  summary_notes TEXT NOT NULL, -- Private to Client/Inspector/Admin
  provider_feedback TEXT,     -- Safe correction instructions shared with Provider
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active Inspection Assignment Constraint (Only ONE active inspection assignment per milestone)
CREATE UNIQUE INDEX idx_unique_active_inspection_assignment 
  ON public.inspection_assignments (milestone_id) 
  WHERE status IN ('ASSIGNED', 'ACCEPTED', 'VISIT_REQUIRED');

CREATE TABLE public.inspector_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.inspection_reports(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES public.users(id),
  storage_path TEXT NOT NULL,
  media_type media_type NOT NULL,
  notes TEXT,
  file_size INT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  status payment_status NOT NULL DEFAULT 'NOT_DUE',
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  recorded_by_user_id UUID NOT NULL REFERENCES public.users(id),
  reference_no TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES public.projects(id),
  client_id UUID NOT NULL REFERENCES public.users(id),
  provider_id UUID NOT NULL REFERENCES public.users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'IN_APP',
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HARDENED PUBLIC JOB LISTINGS VIEW & PRIVILEGE GRANULARITY
-- Explicitly REVOKE broad table SELECT on projects from anon
REVOKE ALL ON public.projects FROM PUBLIC, anon;

-- Grant column-level access ONLY for safe non-private public fields
GRANT SELECT (id, title, category_id, location_id, status, visibility, description, created_at) ON public.projects TO anon;

CREATE OR REPLACE VIEW public.public_job_listings
WITH (security_invoker = true) AS
SELECT 
  p.id AS project_id,
  p.title,
  p.category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  p.location_id,
  l.city,
  l.suburb,
  p.status,
  p.description,
  p.created_at
FROM public.projects p
JOIN public.service_categories c ON p.category_id = c.id
JOIN public.locations l ON p.location_id = l.id
WHERE p.status = 'OPEN_FOR_QUOTATIONS' AND p.visibility = 'MARKETPLACE';

GRANT SELECT ON public.public_job_listings TO anon, authenticated;

-- 4. AUTOMATIC QUOTATION RECALCULATION TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.trg_recalculate_quotation_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_quote_id UUID;
  v_labor NUMERIC(12,2);
  v_material NUMERIC(12,2);
BEGIN
  v_quote_id := COALESCE(NEW.quotation_id, OLD.quotation_id);

  SELECT COALESCE(SUM(line_total), 0) INTO v_labor
  FROM public.quotation_items
  WHERE quotation_id = v_quote_id AND item_type = 'LABOUR';

  SELECT COALESCE(SUM(line_total), 0) INTO v_material
  FROM public.quotation_items
  WHERE quotation_id = v_quote_id AND item_type = 'MATERIAL';

  UPDATE public.quotations
  SET 
    labor_subtotal = v_labor,
    material_subtotal = v_material,
    total_amount = v_labor + v_material
  WHERE id = v_quote_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_quotation_items_recalculate
AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
FOR EACH ROW EXECUTE FUNCTION public.trg_recalculate_quotation_totals();

-- 5. HARDENED CONCURRENCY-SAFE SECURITY DEFINER TRANSACTION FUNCTION
CREATE OR REPLACE FUNCTION public.select_provider_for_project(
  p_project_id UUID,
  p_quotation_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id UUID;
  v_provider_id UUID;
  v_quote_project_id UUID;
  v_project_status project_status;
  v_quote_status quotation_status;
  v_total_amount NUMERIC(12,2);
  v_assignment_id UUID;
  v_project_title TEXT;
BEGIN
  -- 1. ROW LOCK PROJECT (Prevents race conditions / double selections)
  SELECT client_id, title, status 
  INTO v_client_id, v_project_title, v_project_status
  FROM public.projects
  WHERE id = p_project_id
  FOR UPDATE;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Project not found.';
  END IF;

  IF v_client_id != auth.uid() AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN') THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this project.';
  END IF;

  IF v_project_status != 'OPEN_FOR_QUOTATIONS' THEN
    RAISE EXCEPTION 'Project is no longer open for provider selection. Current status: %', v_project_status;
  END IF;

  -- 2. ROW LOCK QUOTATION
  SELECT provider_id, project_id, status, total_amount 
  INTO v_provider_id, v_quote_project_id, v_quote_status, v_total_amount
  FROM public.quotations
  WHERE id = p_quotation_id
  FOR UPDATE;

  IF v_quote_project_id IS NULL OR v_quote_project_id != p_project_id THEN
    RAISE EXCEPTION 'Invalid quotation for this project.';
  END IF;

  IF v_quote_status != 'SUBMITTED' THEN
    RAISE EXCEPTION 'Quotation status is not SUBMITTED.';
  END IF;

  -- 3. Atomic State Modifications
  UPDATE public.quotations SET status = 'ACCEPTED' WHERE id = p_quotation_id;
  UPDATE public.quotations SET status = 'REJECTED' WHERE project_id = p_project_id AND id != p_quotation_id AND status = 'SUBMITTED';
  UPDATE public.projects SET status = 'PROVIDER_SELECTED' WHERE id = p_project_id;

  -- 4. Atomic Assignment Insertion
  INSERT INTO public.project_provider_assignments (project_id, provider_id, accepted_quotation_id, status)
  VALUES (p_project_id, v_provider_id, p_quotation_id, 'ACTIVE')
  RETURNING id INTO v_assignment_id;

  -- 5. Notifications & Audit Logs
  INSERT INTO public.notifications (user_id, title, message, type, channel)
  VALUES (
    v_provider_id,
    'Quotation Accepted!',
    'Congratulations! Your quotation for ' || v_project_title || ' has been accepted.',
    'QUOTATION_SELECTED',
    'IN_APP'
  );

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'PROVIDER_ASSIGNED',
    'ProjectProviderAssignment',
    v_assignment_id,
    jsonb_build_object('projectId', p_project_id, 'quotationId', p_quotation_id, 'providerId', v_provider_id)
  );

  RETURN v_assignment_id;
END;
$$;

-- RESTRICT FUNCTION EXECUTION GRANTS
REVOKE EXECUTE ON FUNCTION public.select_provider_for_project(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.select_provider_for_project(UUID, UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.trg_recalculate_quotation_totals() FROM PUBLIC, anon;

-- 6. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspector_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_provider_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspector_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- User Policies: Users cannot change their own role to ADMIN
CREATE POLICY "Users view own or provider records" ON public.users
  FOR SELECT USING (auth.uid() = id OR role = 'PROVIDER');

CREATE POLICY "Users update own non-role data" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- Project Policies
CREATE POLICY "Client reads own projects" ON public.projects
  FOR SELECT USING (
    client_id = auth.uid()
    OR (status = 'OPEN_FOR_QUOTATIONS' AND visibility = 'MARKETPLACE')
    OR EXISTS (SELECT 1 FROM public.project_provider_assignments WHERE project_id = projects.id AND provider_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

CREATE POLICY "Clients create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = client_id AND EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'CLIENT'));

CREATE POLICY "Clients update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = client_id OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN'));

-- Quotation Secrecy Policies
CREATE POLICY "Read quotes secrecy" ON public.quotations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = quotations.project_id AND projects.client_id = auth.uid())
    OR provider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

CREATE POLICY "Providers manage own quotes" ON public.quotations
  FOR ALL USING (auth.uid() = provider_id AND EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'PROVIDER'));

-- Project Provider Assignments Policy
CREATE POLICY "Assignments read by client provider admin" ON public.project_provider_assignments
  FOR SELECT USING (
    provider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_provider_assignments.project_id AND projects.client_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

-- Inspector Evidence RLS
CREATE POLICY "Inspector evidence read restricted" ON public.inspector_evidence
  FOR SELECT USING (
    uploaded_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.inspection_reports r
      JOIN public.milestones m ON r.milestone_id = m.id
      JOIN public.projects p ON m.project_id = p.id
      WHERE r.id = inspector_evidence.report_id AND p.client_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

CREATE POLICY "Assigned inspector uploads evidence" ON public.inspector_evidence
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by_user_id AND EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'INSPECTOR'));

-- 7. Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('project-documents', 'project-documents', false),
  ('provider-evidence', 'provider-evidence', false),
  ('inspector-evidence', 'inspector-evidence', false),
  ('provider-portfolios', 'provider-portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Data: Chinhoyi Launch Locations & Service Categories
INSERT INTO public.locations (country, province, city, suburb) VALUES
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Hunyani'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Orange Groove'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Cold Stream'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Rujeko'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Brundish'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Chinhoyi Central')
ON CONFLICT DO NOTHING;

INSERT INTO public.service_categories (name, slug, description, icon_name) VALUES
  ('Builders & Masonry', 'building', 'Bricklaying, foundations, slab casting, and structural walling.', 'Hammer'),
  ('Plumbers', 'plumbing', 'Piping, drainage, borehole connections, septic tanks, and bathroom fitting.', 'Wrench'),
  ('Electricians', 'electrical', 'Tubing, wiring, solar installation, distribution boards, and DB testing.', 'Zap'),
  ('Painters', 'painting', 'Interior/exterior painting, damp proofing, primer, and finishing coats.', 'Paintbrush'),
  ('Carpenters', 'carpentry', 'Roof trusses, door fitting, fitted kitchens, and built-in cupboards.', 'Axe'),
  ('Tilers', 'tiling', 'Floor/wall tiling, porcelain, ceramic, coping, and paving.', 'LayoutGrid'),
  ('Roofers', 'roofing', 'Roof sheeting, tiling, waterproofing, gutters, and fascia boards.', 'Home'),
  ('Welders & Steelwork', 'welding', 'Security gates, window frames, tank stands, and perimeter fencing.', 'Flame')
ON CONFLICT DO NOTHING;
