-- ============================================================================
-- KUVAKAHUB PHASE 5 MIGRATION: PILOT HARDENING, INDEXES, & IDEMPOTENCY
-- ============================================================================

-- 1. PERFORMANCE INDEXES FOR REAL PILOT QUERY PATTERNS
CREATE INDEX IF NOT EXISTS idx_projects_client_status ON public.projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_quotations_project_status ON public.quotations(project_id, status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_status ON public.milestones(project_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_records_milestone_status ON public.payment_records(milestone_id, status);
CREATE INDEX IF NOT EXISTS idx_inspection_assignments_inspector ON public.inspection_assignments(inspector_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- 2. USER FEEDBACK TABLE FOR PILOT USERS
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    user_role TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('CONFUSING', 'BROKEN', 'FEATURE_SUGGESTION', 'OTHER')),
    message TEXT NOT NULL,
    page_context TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRIVACY-SAFE ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    event_name TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can submit pilot feedback" ON public.user_feedback
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view pilot user feedback" ON public.user_feedback
    FOR SELECT TO authenticated
    USING (public.check_user_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Authenticated users can log analytics events" ON public.analytics_events
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can view analytics events" ON public.analytics_events
    FOR SELECT TO authenticated
    USING (public.check_user_role(auth.uid(), 'ADMIN'));

-- ============================================================================
-- STRICT PAYMENT TRANSITION & IDEMPOTENCY SERVER FUNCTIONS
-- ============================================================================

-- Strict Mark Paid with Idempotency Lock and Reverse-Transition Prevention
CREATE OR REPLACE FUNCTION public.mark_payment_paid_idempotent(
    p_milestone_id UUID,
    p_client_id UUID,
    p_method_label TEXT,
    p_external_ref TEXT,
    p_client_note TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_record public.payment_records%ROWTYPE;
BEGIN
    SELECT * INTO v_record FROM public.payment_records 
    WHERE milestone_id = p_milestone_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found';
    END IF;

    IF v_record.client_id != p_client_id THEN
        RAISE EXCEPTION 'Unauthorized client';
    END IF;

    -- Idempotent check: If already PAID, safely return true without duplicating state
    IF v_record.status = 'PAID' THEN
        RETURN TRUE;
    END IF;

    -- Enforce valid forward state transitions only
    IF v_record.status NOT IN ('APPROVED', 'PENDING_APPROVAL') THEN
        RAISE EXCEPTION 'Invalid payment state transition from % to PAID', v_record.status;
    END IF;

    UPDATE public.payment_records
    SET status = 'PAID',
        paid_at = NOW(),
        payment_method_label = p_method_label,
        external_reference = p_external_ref,
        client_note = p_client_note,
        updated_at = NOW()
    WHERE milestone_id = p_milestone_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
