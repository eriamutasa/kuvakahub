-- ============================================================================
-- KUVAKAHUB PHASE 4 MIGRATION: FINANCIAL TRACKING, DISPUTES, & REVIEWS
-- ============================================================================

-- 1. PAYMENT RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL UNIQUE REFERENCES public.milestones(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    provider_id UUID NOT NULL REFERENCES public.profiles(id),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'NOT_DUE' CHECK (status IN ('NOT_DUE', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'DISPUTED')),
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    payment_method_label TEXT,
    external_reference TEXT,
    client_note TEXT,
    provider_acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for payment queries
CREATE INDEX IF NOT EXISTS idx_payment_records_project ON public.payment_records(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_milestone ON public.payment_records(milestone_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_client ON public.payment_records(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_provider ON public.payment_records(provider_id);

-- 2. PAYMENT DISPUTES TABLE
CREATE TABLE IF NOT EXISTS public.payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_record_id UUID NOT NULL REFERENCES public.payment_records(id) ON DELETE CASCADE,
    raised_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED')),
    resolved_at TIMESTAMPTZ,
    resolved_by_admin_id UUID REFERENCES public.profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_disputes_record ON public.payment_disputes(payment_record_id);

-- 3. PROVIDER VERIFIED REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.provider_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    reviewer_client_id UUID NOT NULL REFERENCES public.profiles(id),
    provider_id UUID NOT NULL REFERENCES public.profiles(id),
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    timeliness_rating INT CHECK (timeliness_rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_client_project_review UNIQUE (project_id, reviewer_client_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider ON public.provider_reviews(provider_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

-- Payment Records Policies
CREATE POLICY "Clients can view own project payment records" ON public.payment_records
    FOR SELECT TO authenticated
    USING (client_id = auth.uid() OR public.check_user_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Providers can view assigned project payment records" ON public.payment_records
    FOR SELECT TO authenticated
    USING (provider_id = auth.uid() OR public.check_user_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Clients can update payment record approval & paid state" ON public.payment_records
    FOR UPDATE TO authenticated
    USING (client_id = auth.uid())
    WITH CHECK (client_id = auth.uid());

CREATE POLICY "Providers can acknowledge receipt on assigned payment records" ON public.payment_records
    FOR UPDATE TO authenticated
    USING (provider_id = auth.uid())
    WITH CHECK (provider_id = auth.uid());

-- Payment Disputes Policies
CREATE POLICY "Clients and Providers can view disputes for their payment records" ON public.payment_disputes
    FOR SELECT TO authenticated
    USING (
        raised_by_user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.payment_records pr 
            WHERE pr.id = payment_record_id AND (pr.client_id = auth.uid() OR pr.provider_id = auth.uid())
        ) OR 
        public.check_user_role(auth.uid(), 'ADMIN')
    );

CREATE POLICY "Participants can raise payment disputes" ON public.payment_disputes
    FOR INSERT TO authenticated
    WITH CHECK (
        raised_by_user_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM public.payment_records pr 
            WHERE pr.id = payment_record_id AND (pr.client_id = auth.uid() OR pr.provider_id = auth.uid())
        )
    );

CREATE POLICY "Admins can update payment disputes" ON public.payment_disputes
    FOR UPDATE TO authenticated
    USING (public.check_user_role(auth.uid(), 'ADMIN'))
    WITH CHECK (public.check_user_role(auth.uid(), 'ADMIN'));

-- Provider Reviews Policies
CREATE POLICY "Public & Authenticated can view verified provider reviews" ON public.provider_reviews
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Clients can insert review for completed owned projects" ON public.provider_reviews
    FOR INSERT TO authenticated
    WITH CHECK (
        reviewer_client_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.client_id = auth.uid() AND p.status = 'COMPLETED'
        ) AND
        EXISTS (
            SELECT 1 FROM public.project_provider_assignments ppa
            WHERE ppa.project_id = project_id AND ppa.provider_id = provider_id AND ppa.status = 'ACTIVE'
        )
    );

-- ============================================================================
-- ATOMIC STATE-TRANSITION DATABASE FUNCTIONS
-- ============================================================================

-- Function: Approve Milestone Payment
CREATE OR REPLACE FUNCTION public.approve_milestone_payment(
    p_milestone_id UUID,
    p_client_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_milestone_status TEXT;
    v_project_id UUID;
    v_client_id UUID;
BEGIN
    SELECT m.status, m.project_id, p.client_id 
    INTO v_milestone_status, v_project_id, v_client_id
    FROM public.milestones m
    JOIN public.projects p ON p.id = m.project_id
    WHERE m.id = p_milestone_id FOR UPDATE;

    IF v_client_id != p_client_id THEN
        RAISE EXCEPTION 'Unauthorized client';
    END IF;

    IF v_milestone_status != 'CLIENT_APPROVED' THEN
        RAISE EXCEPTION 'Milestone must be CLIENT_APPROVED before payment approval';
    END IF;

    UPDATE public.payment_records
    SET status = 'APPROVED', approved_at = NOW(), updated_at = NOW()
    WHERE milestone_id = p_milestone_id AND client_id = p_client_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete Project
CREATE OR REPLACE FUNCTION public.complete_project(
    p_project_id UUID,
    p_client_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_unapproved_count INT;
BEGIN
    -- Ensure client owns active project
    IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id AND client_id = p_client_id AND status = 'ACTIVE') THEN
        RAISE EXCEPTION 'Project not active or unauthorized client';
    END IF;

    -- Ensure all milestones are CLIENT_APPROVED
    SELECT COUNT(*) INTO v_unapproved_count
    FROM public.milestones
    WHERE project_id = p_project_id AND status != 'CLIENT_APPROVED';

    IF v_unapproved_count > 0 THEN
        RAISE EXCEPTION 'Cannot complete project with unapproved milestones (% remaining)', v_unapproved_count;
    END IF;

    UPDATE public.projects
    SET status = 'COMPLETED', updated_at = NOW()
    WHERE id = p_project_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
