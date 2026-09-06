-- RLS / RPC security matrix. Runs as the superuser to seed, then impersonates
-- real JWT subjects by switching to the `authenticated` / `anon` roles with
-- request.jwt.claims set, exactly as PostgREST does.
--
-- Conventions:
--   test.login(uid)   -> become that user (role authenticated)
--   test.anon()       -> become an anonymous visitor
--   RESET ROLE        -> back to superuser for seeding
--   test.assert(...)  -> raises on false
--   test.denied(sql)  -> raises unless the statement errors
--   test.rows(sql)    -> row count visible to the current session

\set ON_ERROR_STOP on
\set QUIET on

-- ---------------------------------------------------------------------------
-- Harness
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS test;
GRANT USAGE ON SCHEMA test TO anon, authenticated;

CREATE OR REPLACE FUNCTION test.assert(p_cond BOOLEAN, p_msg TEXT) RETURNS TEXT
LANGUAGE plpgsql AS $$
BEGIN
  IF p_cond IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'FAIL: %', p_msg;
  END IF;
  RETURN 'PASS: ' || p_msg;
END $$;

CREATE OR REPLACE FUNCTION test.denied(p_sql TEXT, p_msg TEXT) RETURNS TEXT
LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    RETURN 'PASS (denied): ' || p_msg || ' -> ' || SQLERRM;
  END;
  RAISE EXCEPTION 'FAIL (expected denial): %', p_msg;
END $$;

CREATE OR REPLACE FUNCTION test.rows(p_sql TEXT) RETURNS BIGINT
LANGUAGE plpgsql AS $$
DECLARE n BIGINT;
BEGIN
  EXECUTE 'SELECT count(*) FROM (' || p_sql || ') s' INTO n;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION test.login(p_uid UUID) RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, false);
  PERFORM set_config('role', 'authenticated', false);
END $$;

CREATE OR REPLACE FUNCTION test.anon() RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', false);
  PERFORM set_config('role', 'anon', false);
END $$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Fixed identities
-- ---------------------------------------------------------------------------
\set client_a   '11111111-1111-1111-1111-111111111111'
\set client_b   '22222222-2222-2222-2222-222222222222'
\set provider_a '33333333-3333-3333-3333-333333333333'
\set provider_b '44444444-4444-4444-4444-444444444444'
\set provider_c '55555555-5555-5555-5555-555555555555'
\set inspector  '66666666-6666-6666-6666-666666666666'
\set admin      '77777777-7777-7777-7777-777777777777'
\set evil_admin '88888888-8888-8888-8888-888888888888'
\set evil_insp  '99999999-9999-9999-9999-999999999999'

\set p1 'aaaaaaaa-0000-0000-0000-000000000001'
\set p2 'aaaaaaaa-0000-0000-0000-000000000002'
\set p3 'aaaaaaaa-0000-0000-0000-000000000003'
\set qa 'bbbbbbbb-0000-0000-0000-000000000001'
\set qb 'bbbbbbbb-0000-0000-0000-000000000002'
\set m1 'cccccccc-0000-0000-0000-000000000001'
\set m2 'cccccccc-0000-0000-0000-000000000002'
\set ia1 'dddddddd-0000-0000-0000-000000000001'
\set r1 'eeeeeeee-0000-0000-0000-000000000001'

-- ---------------------------------------------------------------------------
-- Seed: signups through auth.users (exercises the trigger)
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  (:'client_a',   'client.a@example.com',   '{"full_name":"Client A","role":"CLIENT"}'),
  (:'client_b',   'client.b@example.com',   '{"full_name":"Client B"}'),
  (:'provider_a', 'provider.a@example.com', '{"full_name":"Provider A","role":"PROVIDER"}'),
  (:'provider_b', 'provider.b@example.com', '{"full_name":"Provider B","role":"provider"}'),
  (:'provider_c', 'provider.c@example.com', '{"full_name":"Provider C","role":"PROVIDER"}'),
  (:'inspector',  'inspector@example.com',  '{"full_name":"Site Inspector"}'),
  (:'admin',      'admin@example.com',      '{"full_name":"Admin Officer"}'),
  (:'evil_admin', 'evil.admin@example.com', '{"full_name":"Evil","role":"ADMIN"}'),
  (:'evil_insp',  'evil.insp@example.com',  '{"full_name":"Evil","role":"INSPECTOR"}');

\set QUIET off
\echo '== signup trigger'
SELECT test.assert((SELECT role::text FROM public.users WHERE id = :'client_a')   = 'CLIENT',   'metadata CLIENT -> CLIENT');
SELECT test.assert((SELECT role::text FROM public.users WHERE id = :'client_b')   = 'CLIENT',   'no metadata -> CLIENT');
SELECT test.assert((SELECT role::text FROM public.users WHERE id = :'provider_a') = 'PROVIDER', 'metadata PROVIDER -> PROVIDER');
SELECT test.assert((SELECT role::text FROM public.users WHERE id = :'provider_b') = 'PROVIDER', 'lowercase provider -> PROVIDER');
SELECT test.assert((SELECT role::text FROM public.users WHERE id = :'evil_admin') = 'CLIENT',   'metadata ADMIN downgraded to CLIENT');
SELECT test.assert((SELECT role::text FROM public.users WHERE id = :'evil_insp')  = 'CLIENT',   'metadata INSPECTOR downgraded to CLIENT');
SELECT test.assert((SELECT full_name FROM public.users WHERE id = :'client_a') = 'Client A',    'full_name copied from metadata');
\set QUIET on

-- Privileged roles are assigned out-of-band (admin / service role), never by signup.
UPDATE public.users SET role = 'INSPECTOR' WHERE id = :'inspector';
UPDATE public.users SET role = 'ADMIN'     WHERE id = :'admin';

INSERT INTO public.client_profiles (user_id, diaspora_country) VALUES (:'client_a', 'Zimbabwe'), (:'client_b', 'United Kingdom');
INSERT INTO public.provider_profiles (user_id, business_name, verification_status, location_id)
VALUES
  (:'provider_a', 'A Builders', 'VERIFIED',   (SELECT id FROM public.locations WHERE suburb = 'Hunyani' LIMIT 1)),
  (:'provider_b', 'B Builders', 'UNVERIFIED', (SELECT id FROM public.locations WHERE suburb = 'Rujeko'  LIMIT 1));
INSERT INTO public.inspector_profiles (user_id, qualifications, verification_status) VALUES (:'inspector', 'NQF5', 'VERIFIED');

INSERT INTO public.projects (id, client_id, title, category_id, location_id, budget_estimate, status, description, address_private)
VALUES
  (:'p1', :'client_a', 'Foundation P1', (SELECT id FROM public.service_categories WHERE slug = 'building'),
   (SELECT id FROM public.locations WHERE suburb = 'Hunyani' LIMIT 1), 6500, 'OPEN_FOR_QUOTATIONS', 'Trench and slab', 'Stand 4182 Hunyani'),
  (:'p2', :'client_b', 'Roof P2', (SELECT id FROM public.service_categories WHERE slug = 'roofing'),
   (SELECT id FROM public.locations WHERE suburb = 'Rujeko' LIMIT 1), 3000, 'DRAFT', 'Roof sheeting', 'Stand 9 Rujeko'),
  (:'p3', :'client_a', 'Marketplace P3', (SELECT id FROM public.service_categories WHERE slug = 'painting'),
   (SELECT id FROM public.locations WHERE suburb = 'Cherima' LIMIT 1), 1200, 'OPEN_FOR_QUOTATIONS', 'Exterior paint', 'Stand 77 Cherima');

INSERT INTO public.quotations (id, project_id, provider_id, est_duration_days, notes)
VALUES (:'qa', :'p1', :'provider_a', 14, 'A quote'), (:'qb', :'p1', :'provider_b', 10, 'B quote');
INSERT INTO public.quotation_items (quotation_id, item_type, description, quantity, unit, unit_price)
VALUES (:'qa', 'LABOUR', 'Trenching', 10, 'm', 20), (:'qa', 'MATERIAL', 'Cement', 40, 'bag', 12),
       (:'qb', 'LABOUR', 'Trenching', 10, 'm', 18), (:'qb', 'MATERIAL', 'Cement', 40, 'bag', 11);

\set QUIET off
\echo '== provider selection RPC (client_a awards to provider_a)'
SELECT test.login(:'client_a');
SELECT test.assert(public.select_provider_for_project(:'p1', :'qa') IS NOT NULL, 'select_provider_for_project succeeds for owner');
RESET ROLE;
SELECT test.assert((SELECT status::text FROM public.quotations WHERE id = :'qb') = 'REJECTED', 'competing quote auto-rejected');
SELECT test.assert((SELECT count(*) FROM public.project_provider_assignments WHERE project_id = :'p1' AND status = 'ACTIVE') = 1, 'one ACTIVE assignment');
\set QUIET on

UPDATE public.projects SET status = 'ACTIVE' WHERE id = :'p1';
INSERT INTO public.milestones (id, project_id, title, order_index, amount, status)
VALUES (:'m1', :'p1', 'Foundation', 1, 500, 'IN_PROGRESS'), (:'m2', :'p1', 'Slab', 2, 700, 'NOT_STARTED');

INSERT INTO public.notifications (user_id, title, message, type)
VALUES (:'client_a', 'Hello A', 'client msg', 'INFO'), (:'provider_a', 'Hello P', 'provider msg', 'INFO');

-- ---------------------------------------------------------------------------
\set QUIET off
\echo '== admin assigns inspector (policy-driven insert)'
SELECT test.login(:'admin');
INSERT INTO public.inspection_assignments (id, milestone_id, inspector_id, assigned_by_admin_id)
VALUES (:'ia1', :'m1', :'inspector', :'admin');
SELECT test.denied(
  format('INSERT INTO public.inspection_assignments (milestone_id, inspector_id, assigned_by_admin_id) VALUES (%L, %L, %L)', :'m2', :'provider_a', :'admin'),
  'admin cannot assign a non-INSPECTOR as inspector');
RESET ROLE;

\echo '== inspector submits report + evidence'
SELECT test.login(:'inspector');
INSERT INTO public.inspection_reports (id, milestone_id, inspector_id, assignment_id, result, summary_notes, provider_feedback)
VALUES (:'r1', :'m1', :'inspector', :'ia1', 'NEEDS_ATTENTION', 'PRIVATE: cracks on east wall, suspect poor mix', 'Re-plaster east wall');
INSERT INTO public.inspector_evidence (report_id, uploaded_by_user_id, storage_path, media_type)
VALUES (:'r1', :'inspector', 'projects/' || :'p1' || '/milestones/' || :'m1' || '/inspector/crack.jpg', 'IMAGE');
SELECT test.denied(
  format('INSERT INTO public.inspection_reports (milestone_id, inspector_id, result, summary_notes) VALUES (%L, %L, %L, %L)', :'m2', :'inspector', 'VERIFIED', 'x'),
  'inspector cannot report on an unassigned milestone');
RESET ROLE;

\echo '== provider uploads evidence'
SELECT test.login(:'provider_a');
INSERT INTO public.provider_evidence (milestone_id, uploaded_by_user_id, storage_path, media_type)
VALUES (:'m1', :'provider_a', 'projects/' || :'p1' || '/milestones/' || :'m1' || '/provider/wall.jpg', 'IMAGE');
RESET ROLE;
SELECT test.login(:'provider_b');
SELECT test.denied(
  format('INSERT INTO public.provider_evidence (milestone_id, uploaded_by_user_id, storage_path, media_type) VALUES (%L, %L, %L, %L)', :'m1', :'provider_b', 'x.jpg', 'IMAGE'),
  'non-assigned provider cannot upload evidence');
RESET ROLE;

-- ---------------------------------------------------------------------------
\echo '== 1. CLIENT cannot read another client''s private project data'
SELECT test.login(:'client_b');
SELECT test.assert(test.rows(format('SELECT id FROM public.projects WHERE id = %L', :'p1')) = 0, 'client_b cannot see ACTIVE project P1 at all');
SELECT test.assert(test.rows(format('SELECT id FROM public.projects WHERE id = %L', :'p3')) = 1, 'client_b can see marketplace-open P3 row');
SELECT test.denied(format('SELECT address_private FROM public.projects WHERE id = %L', :'p3'), 'client_b cannot select address_private column');
SELECT test.denied(format('SELECT budget_estimate FROM public.projects WHERE id = %L', :'p3'), 'client_b cannot select budget_estimate column');
SELECT test.assert(test.rows(format('SELECT * FROM public.project_private_details WHERE project_id IN (%L,%L)', :'p1', :'p3')) = 0, 'client_b sees no private details for A''s projects');
SELECT test.assert(test.rows(format('SELECT * FROM public.project_private_details WHERE project_id = %L', :'p2')) = 1, 'client_b sees private details of own project');
SELECT test.assert(test.rows('SELECT id FROM public.projects') >= 1, 'projects SELECT does not hit policy recursion');
SELECT test.denied('SELECT * FROM public.projects', 'SELECT * on projects is refused for authenticated (private columns revoked)');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.assert((SELECT address_private FROM public.project_private_details WHERE project_id = :'p1') = 'Stand 4182 Hunyani', 'owner reads own private address');
RESET ROLE;
SELECT test.login(:'provider_a');
SELECT test.assert(test.rows(format('SELECT * FROM public.project_private_details WHERE project_id = %L', :'p1')) = 1, 'assigned provider reads private details of awarded project');
SELECT test.assert(test.rows(format('SELECT * FROM public.project_private_details WHERE project_id = %L', :'p3')) = 0, 'assigned provider cannot read private details of other projects');
RESET ROLE;

\echo '== 2. PROVIDER cannot read competing quotations'
SELECT test.login(:'provider_b');
SELECT test.assert(test.rows(format('SELECT * FROM public.quotations WHERE id = %L', :'qa')) = 0, 'provider_b cannot see provider_a quotation');
SELECT test.assert(test.rows(format('SELECT * FROM public.quotations WHERE id = %L', :'qb')) = 1, 'provider_b sees own quotation');
SELECT test.assert(test.rows(format('SELECT * FROM public.quotation_items WHERE quotation_id = %L', :'qa')) = 0, 'provider_b cannot see provider_a items');
SELECT test.assert(test.rows(format('SELECT * FROM public.quotation_items WHERE quotation_id = %L', :'qb')) = 2, 'provider_b sees own items');
SELECT test.denied(format('INSERT INTO public.quotation_items (quotation_id, item_type, description, quantity, unit, unit_price) VALUES (%L, %L, %L, 1, %L, 1)', :'qa', 'LABOUR', 'sneak', 'ea'), 'provider_b cannot add items to provider_a quotation');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.assert(test.rows(format('SELECT * FROM public.quotations WHERE project_id = %L', :'p1')) = 2, 'project client sees all quotations');
SELECT test.assert(test.rows(format('SELECT * FROM public.quotation_items qi JOIN public.quotations q ON q.id = qi.quotation_id WHERE q.project_id = %L', :'p1')) = 4, 'project client sees all items');
RESET ROLE;

\echo '== 3. PROVIDER cannot read inspector private evidence or summary_notes'
SELECT test.login(:'provider_a');
SELECT test.assert(test.rows(format('SELECT * FROM public.inspection_reports WHERE id = %L', :'r1')) = 0, 'provider cannot read inspection_reports base table');
SELECT test.assert(test.rows(format('SELECT * FROM public.inspector_evidence WHERE report_id = %L', :'r1')) = 0, 'provider cannot read inspector_evidence');
SELECT test.assert((SELECT provider_feedback FROM public.provider_inspection_feedback WHERE id = :'r1') = 'Re-plaster east wall', 'provider reads provider_feedback via view');
SELECT test.assert(test.rows('SELECT * FROM public.inspection_assignments') = 1, 'provider sees inspection is scheduled on own project');
RESET ROLE;
SELECT test.login(:'provider_b');
SELECT test.assert(test.rows('SELECT * FROM public.provider_inspection_feedback') = 0, 'non-assigned provider sees no feedback rows');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.assert((SELECT summary_notes FROM public.inspection_reports WHERE id = :'r1') LIKE 'PRIVATE:%', 'project client reads summary_notes');
SELECT test.assert(test.rows(format('SELECT * FROM public.inspector_evidence WHERE report_id = %L', :'r1')) = 1, 'project client reads inspector evidence');
RESET ROLE;

\echo '== 4. PROVIDER cannot self-verify'
SELECT test.login(:'provider_b');
SELECT test.denied(format('UPDATE public.provider_profiles SET verification_status = %L WHERE user_id = %L', 'VERIFIED', :'provider_b'), 'provider cannot set own verification_status');
SELECT test.denied(format('UPDATE public.provider_profiles SET avg_rating = 5 WHERE user_id = %L', :'provider_b'), 'provider cannot set own avg_rating');
UPDATE public.provider_profiles SET bio = 'Updated bio' WHERE user_id = :'provider_b';
SELECT test.assert((SELECT bio FROM public.provider_profiles WHERE user_id = :'provider_b') = 'Updated bio', 'provider can update own bio');
SELECT test.assert(test.rows(format('SELECT * FROM public.provider_profiles WHERE user_id = %L', :'provider_a')) = 0, 'provider cannot read another provider profile row');
RESET ROLE;
SELECT test.login(:'provider_c');
SELECT test.denied(format('INSERT INTO public.provider_profiles (user_id, business_name, verification_status) VALUES (%L, %L, %L)', :'provider_c', 'C', 'VERIFIED'), 'provider cannot create a pre-verified profile');
INSERT INTO public.provider_profiles (user_id, business_name) VALUES (:'provider_c', 'C Builders');
SELECT test.assert((SELECT verification_status::text FROM public.provider_profiles WHERE user_id = :'provider_c') = 'UNVERIFIED', 'new provider profile is UNVERIFIED');
RESET ROLE;
SELECT test.login(:'admin');
UPDATE public.provider_profiles SET verification_status = 'VERIFIED' WHERE user_id = :'provider_b';
SELECT test.assert((SELECT verification_status::text FROM public.provider_profiles WHERE user_id = :'provider_b') = 'VERIFIED', 'admin can verify a provider');
RESET ROLE;
SELECT test.login(:'inspector');
SELECT test.denied(format('UPDATE public.inspector_profiles SET verification_status = %L WHERE user_id = %L', 'REJECTED', :'inspector'), 'inspector cannot change own verification_status');
RESET ROLE;

\echo '== 5. INSPECTOR cannot act as ADMIN'
SELECT test.login(:'inspector');
SELECT test.denied(format('INSERT INTO public.inspection_assignments (milestone_id, inspector_id, assigned_by_admin_id) VALUES (%L, %L, %L)', :'m2', :'inspector', :'inspector'), 'inspector cannot self-assign inspections');
SELECT test.assert(test.rows('SELECT * FROM public.audit_logs') = 0, 'inspector cannot read audit logs');
SELECT test.assert(test.rows('SELECT * FROM public.users') = 1, 'inspector sees only own user row');
UPDATE public.provider_profiles SET verification_status = 'REJECTED' WHERE user_id = :'provider_c';
RESET ROLE;
SELECT test.assert((SELECT verification_status::text FROM public.provider_profiles WHERE user_id = :'provider_c') = 'UNVERIFIED', 'inspector update on provider verification affected no rows');
SELECT test.login(:'inspector');
SELECT test.denied(format('UPDATE public.users SET role = %L WHERE id = %L', 'ADMIN', :'inspector'), 'inspector cannot promote self to ADMIN');
RESET ROLE;

\echo '== 6. CLIENT cannot mark themselves ADMIN'
SELECT test.login(:'client_a');
SELECT test.denied(format('UPDATE public.users SET role = %L WHERE id = %L', 'ADMIN', :'client_a'), 'client cannot change own role');
SELECT test.denied(format('INSERT INTO public.users (id, email, role, full_name) VALUES (%L, %L, %L, %L)', gen_random_uuid(), 'x@x.com', 'ADMIN', 'X'), 'client cannot insert a users row');
UPDATE public.users SET full_name = 'Client A Renamed' WHERE id = :'client_a';
SELECT test.assert((SELECT full_name FROM public.users WHERE id = :'client_a') = 'Client A Renamed', 'client can update own non-role data');
SELECT test.assert(test.rows(format('SELECT * FROM public.users WHERE id = %L', :'provider_a')) = 0, 'client cannot read provider contact row');
RESET ROLE;

\echo '== 7. User cannot read another user''s notifications'
SELECT test.login(:'client_a');
SELECT test.assert(test.rows('SELECT * FROM public.notifications') = 1, 'client_a sees exactly own notification');
SELECT test.assert(test.rows(format('SELECT * FROM public.notifications WHERE user_id = %L', :'provider_a')) = 0, 'client_a cannot see provider notification');
UPDATE public.notifications SET is_read = TRUE WHERE user_id = :'client_a';
SELECT test.assert((SELECT is_read FROM public.notifications WHERE user_id = :'client_a') = TRUE, 'client_a can mark own notification read');
SELECT test.denied(format('UPDATE public.notifications SET title = %L WHERE user_id = %L', 'hax', :'client_a'), 'client cannot edit notification content');
SELECT test.denied(format('INSERT INTO public.notifications (user_id, title, message, type) VALUES (%L, %L, %L, %L)', :'provider_a', 'spam', 'spam', 'INFO'), 'client cannot insert platform notifications');
SELECT test.denied('DELETE FROM public.notifications', 'client cannot delete notifications');
RESET ROLE;
-- 2 seeded + 1 written by select_provider_for_project for the awarded provider
SELECT test.assert((SELECT count(*) FROM public.notifications) = 3, 'notification rows intact');

\echo '== 8. Anonymous user cannot access private data'
SELECT test.anon();
SELECT test.assert(test.rows('SELECT id FROM public.projects') = 1, 'anon sees only marketplace-open projects');
SELECT test.denied('SELECT address_private FROM public.projects', 'anon cannot select address_private');
SELECT test.assert(test.rows('SELECT * FROM public.public_job_listings') = 1, 'anon can use public_job_listings');
SELECT test.assert(test.rows('SELECT * FROM public.payment_records') = 0, 'anon sees no payment records');
SELECT test.assert(test.rows('SELECT * FROM public.inspector_evidence') = 0, 'anon sees no inspector evidence');
SELECT test.assert(test.rows('SELECT * FROM public.provider_evidence') = 0, 'anon sees no provider evidence');
SELECT test.assert(test.rows('SELECT * FROM public.quotations') = 0, 'anon sees no quotations');
SELECT test.assert(test.rows('SELECT * FROM public.notifications') = 0, 'anon sees no notifications');
SELECT test.assert(test.rows('SELECT * FROM public.users') = 0, 'anon sees no users');
SELECT test.assert(test.rows('SELECT * FROM public.milestones') = 0, 'anon sees no milestones');
SELECT test.denied('SELECT * FROM public.project_private_details', 'anon cannot query project_private_details');
SELECT test.denied('SELECT * FROM public.provider_inspection_feedback', 'anon cannot query provider_inspection_feedback');
SELECT test.assert(test.rows('SELECT * FROM public.provider_directory') = 2, 'anon sees VERIFIED providers in directory (a, b)');
SELECT test.assert(test.rows(format('SELECT * FROM public.provider_directory WHERE user_id = %L', :'provider_c')) = 0, 'unverified provider hidden from directory');
SELECT test.denied(format('SELECT public.approve_milestone_payment(%L, %L)', :'m1', :'client_a'), 'anon cannot execute payment RPC');
RESET ROLE;

\echo '== 9. Payment RPCs derive identity from auth.uid()'
UPDATE public.milestones SET status = 'CLIENT_APPROVED' WHERE id = :'m1';
SELECT test.login(:'client_b');
SELECT test.denied(format('SELECT public.approve_milestone_payment(%L, %L)', :'m1', :'client_a'), 'spoofed p_client_id rejected');
SELECT test.denied(format('SELECT public.approve_milestone_payment(%L, %L)', :'m1', :'client_b'), 'non-owner rejected even with own id');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.assert(public.approve_milestone_payment(:'m1', :'client_a'), 'owner approves payment');
SELECT test.assert(public.approve_milestone_payment(:'m1', NULL), 'approve is idempotent (NULL p_client_id accepted)');
SELECT test.assert((SELECT status::text FROM public.payment_records WHERE milestone_id = :'m1') = 'APPROVED', 'record APPROVED');
SELECT test.assert((SELECT provider_id FROM public.payment_records WHERE milestone_id = :'m1') = :'provider_a', 'provider_id derived from assignment');
SELECT test.assert((SELECT client_id FROM public.payment_records WHERE milestone_id = :'m1') = :'client_a', 'client_id derived from project');
SELECT test.assert((SELECT project_id FROM public.payment_records WHERE milestone_id = :'m1') = :'p1', 'project_id derived from milestone');
SELECT test.denied(format('UPDATE public.payment_records SET status = %L WHERE milestone_id = %L', 'PAID', :'m1'), 'client cannot flip status directly');
SELECT test.denied(format('INSERT INTO public.payment_records (milestone_id, amount) VALUES (%L, 1)', :'m2'), 'client cannot insert payment records directly');
SELECT test.assert(public.mark_payment_paid_idempotent(:'m1', :'client_a', 'EcoCash', 'REF-001', 'paid'), 'owner marks paid');
SELECT test.assert(public.mark_payment_paid_idempotent(:'m1', :'client_a', 'EcoCash', 'REF-001', 'paid'), 'mark paid is idempotent');
SELECT test.assert((SELECT status::text FROM public.payment_records WHERE milestone_id = :'m1') = 'PAID', 'record PAID');
SELECT test.denied(format('SELECT public.acknowledge_payment_receipt(%L)', :'m1'), 'client cannot acknowledge receipt');
RESET ROLE;
SELECT test.login(:'client_b');
SELECT test.denied(format('SELECT public.mark_payment_paid_idempotent(%L, %L, %L, %L, %L)', :'m1', :'client_a', 'x', 'x', 'x'), 'non-owner cannot mark paid with spoofed id');
SELECT test.assert(test.rows(format('SELECT * FROM public.payment_records WHERE milestone_id = %L', :'m1')) = 0, 'non-party cannot read payment record');
RESET ROLE;
SELECT test.login(:'provider_b');
SELECT test.denied(format('SELECT public.acknowledge_payment_receipt(%L)', :'m1'), 'non-assigned provider cannot acknowledge');
RESET ROLE;
SELECT test.login(:'provider_a');
SELECT test.assert(test.rows(format('SELECT * FROM public.payment_records WHERE milestone_id = %L', :'m1')) = 1, 'assigned provider reads payment record');
SELECT test.assert(public.acknowledge_payment_receipt(:'m1'), 'assigned provider acknowledges receipt');
SELECT test.assert((SELECT provider_acknowledged_at FROM public.payment_records WHERE milestone_id = :'m1') IS NOT NULL, 'acknowledged_at set');
RESET ROLE;

\echo '== 9b. Storage object policies (while engagement is ACTIVE)'
SELECT test.login(:'provider_a');
INSERT INTO storage.objects (bucket_id, name) VALUES ('provider-evidence', 'projects/' || :'p1' || '/milestones/' || :'m1' || '/provider/photo1.jpg');
SELECT test.denied(format('INSERT INTO storage.objects (bucket_id, name) VALUES (%L, %L)', 'inspector-evidence', 'projects/' || :'p1' || '/milestones/' || :'m1' || '/inspector/fake.jpg'), 'provider cannot write inspector-evidence');
SELECT test.denied(format('INSERT INTO storage.objects (bucket_id, name) VALUES (%L, %L)', 'provider-evidence', 'projects/' || :'p2' || '/milestones/' || :'m1' || '/provider/x.jpg'), 'provider cannot write evidence under another project path');
SELECT test.denied(format('INSERT INTO storage.objects (bucket_id, name) VALUES (%L, %L)', 'provider-evidence', 'garbage/path.jpg'), 'malformed path rejected');
RESET ROLE;
SELECT test.login(:'provider_b');
SELECT test.denied(format('INSERT INTO storage.objects (bucket_id, name) VALUES (%L, %L)', 'provider-evidence', 'projects/' || :'p1' || '/milestones/' || :'m1' || '/provider/x.jpg'), 'non-assigned provider cannot write provider-evidence');
SELECT test.assert(test.rows('SELECT * FROM storage.objects') = 0, 'non-assigned provider sees no objects');
RESET ROLE;
SELECT test.login(:'inspector');
INSERT INTO storage.objects (bucket_id, name) VALUES ('inspector-evidence', 'projects/' || :'p1' || '/milestones/' || :'m1' || '/inspector/crack.jpg');
SELECT test.assert(test.rows('SELECT * FROM storage.objects WHERE bucket_id = ''provider-evidence''') = 1, 'inspector reads provider evidence objects');
RESET ROLE;
SELECT test.login(:'provider_a');
SELECT test.assert(test.rows('SELECT * FROM storage.objects WHERE bucket_id = ''inspector-evidence''') = 0, 'provider cannot list inspector-evidence objects');
SELECT test.assert(test.rows('SELECT * FROM storage.objects WHERE bucket_id = ''provider-evidence''') = 1, 'provider reads own evidence objects');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.assert(test.rows('SELECT * FROM storage.objects') = 2, 'project client reads both evidence buckets');
INSERT INTO storage.objects (bucket_id, name) VALUES ('project-documents', 'projects/' || :'p1' || '/plan.pdf');
RESET ROLE;
SELECT test.login(:'client_b');
SELECT test.assert(test.rows('SELECT * FROM storage.objects') = 0, 'other client sees no objects');
SELECT test.denied(format('INSERT INTO storage.objects (bucket_id, name) VALUES (%L, %L)', 'project-documents', 'projects/' || :'p1' || '/evil.pdf'), 'other client cannot upload to project documents');
RESET ROLE;
SELECT test.login(:'provider_a');
INSERT INTO storage.objects (bucket_id, name) VALUES ('provider-portfolios', 'providers/' || :'provider_a' || '/hero.jpg');
SELECT test.denied(format('INSERT INTO storage.objects (bucket_id, name) VALUES (%L, %L)', 'provider-portfolios', 'providers/' || :'provider_b' || '/hero.jpg'), 'provider cannot write to another provider portfolio');
RESET ROLE;
SELECT test.anon();
SELECT test.assert(test.rows('SELECT * FROM storage.objects') = 1, 'anon sees only public portfolio objects');
RESET ROLE;

\echo '== 10. complete_project + post-completion review'
UPDATE public.milestones SET status = 'CLIENT_APPROVED' WHERE id = :'m2';
SELECT test.login(:'client_b');
SELECT test.denied(format('SELECT public.complete_project(%L, %L)', :'p1', :'client_b'), 'non-owner cannot complete project');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.denied(format('INSERT INTO public.provider_reviews (project_id, reviewer_client_id, provider_id, overall_rating, review_text) VALUES (%L, %L, %L, 5, %L)', :'p1', :'client_a', :'provider_a', 'early'), 'no review before completion');
SELECT test.assert(public.complete_project(:'p1', :'client_a'), 'owner completes project');
SELECT test.assert((SELECT status::text FROM public.projects WHERE id = :'p1') = 'COMPLETED', 'project COMPLETED');
INSERT INTO public.provider_reviews (project_id, reviewer_client_id, provider_id, overall_rating, review_text)
VALUES (:'p1', :'client_a', :'provider_a', 5, 'Great work');
SELECT test.assert(test.rows(format('SELECT * FROM public.provider_reviews WHERE project_id = %L', :'p1')) = 1, 'post-completion review accepted');
RESET ROLE;
SELECT test.assert((SELECT status::text FROM public.project_provider_assignments WHERE project_id = :'p1') = 'COMPLETED', 'assignment closed as COMPLETED');
SELECT test.assert((SELECT updated_at > created_at FROM public.projects WHERE id = :'p1'), 'projects.updated_at maintained');
SELECT test.login(:'client_b');
SELECT test.denied(format('INSERT INTO public.provider_reviews (project_id, reviewer_client_id, provider_id, overall_rating, review_text) VALUES (%L, %L, %L, 1, %L)', :'p1', :'client_b', :'provider_a', 'fake'), 'non-owner cannot review');
RESET ROLE;
SELECT test.login(:'provider_a');
SELECT test.assert(test.rows(format('SELECT * FROM public.project_private_details WHERE project_id = %L', :'p1')) = 1, 'provider retains access after completion');
RESET ROLE;
SELECT test.anon();
SELECT test.denied('SELECT * FROM public.reviews', 'anon cannot query deprecated reviews');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.denied('SELECT * FROM public.reviews', 'authenticated cannot query deprecated reviews');
RESET ROLE;

\echo '== 11. Audit logs append-only and admin-only'
SELECT test.assert((SELECT count(*) FROM public.audit_logs) >= 4, 'RPCs wrote audit entries');
SELECT test.login(:'admin');
SELECT test.assert(test.rows('SELECT * FROM public.audit_logs') >= 4, 'admin reads audit logs');
SELECT test.denied('UPDATE public.audit_logs SET action = ''x''', 'admin cannot update audit logs');
SELECT test.denied('DELETE FROM public.audit_logs', 'admin cannot delete audit logs');
SELECT test.denied(format('INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id) VALUES (%L, %L, %L, %L)', :'admin', 'FORGED', 'X', gen_random_uuid()), 'admin cannot insert audit logs directly');
RESET ROLE;
SELECT test.login(:'client_a');
SELECT test.assert(test.rows('SELECT * FROM public.audit_logs') = 0, 'client cannot read audit logs');
RESET ROLE;
SELECT test.denied('UPDATE public.audit_logs SET action = ''x''', 'even table owner cannot mutate audit logs');
SELECT test.denied('DELETE FROM public.audit_logs', 'even table owner cannot delete audit logs');

\echo '== 12. Milestones'
SELECT test.login(:'provider_a');
SELECT test.assert(test.rows('SELECT * FROM public.milestones') = 2, 'assigned provider sees project milestones');
UPDATE public.milestones SET amount = 1 WHERE id = :'m1';
RESET ROLE;
SELECT test.assert((SELECT amount FROM public.milestones WHERE id = :'m1') = 500, 'provider update affected no rows');
SELECT test.login(:'provider_b');
SELECT test.assert(test.rows('SELECT * FROM public.milestones') = 0, 'non-assigned provider sees no milestones');
RESET ROLE;
SELECT test.login(:'inspector');
SELECT test.assert(test.rows('SELECT * FROM public.milestones') = 1, 'inspector sees only assigned milestone');
RESET ROLE;
SELECT test.denied(format('INSERT INTO public.milestones (project_id, title, order_index, amount) VALUES (%L, %L, 1, 1)', :'p1', 'dup'), 'duplicate (project_id, order_index) rejected');

\echo '== 13. Post-completion upload lockout'
SELECT test.login(:'provider_a');
SELECT test.denied(format('INSERT INTO storage.objects (bucket_id, name) VALUES (%L, %L)', 'provider-evidence', 'projects/' || :'p1' || '/milestones/' || :'m1' || '/provider/late.jpg'), 'provider cannot upload evidence after project completion');
SELECT test.assert(test.rows('SELECT * FROM storage.objects WHERE bucket_id = ''provider-evidence''') = 1, 'provider retains read access to own evidence after completion');
RESET ROLE;

\echo '== 14. Admin reach'
SELECT test.login(:'admin');
SELECT test.assert(test.rows('SELECT * FROM public.users') = 9, 'admin reads all users');
SELECT test.assert(test.rows('SELECT id FROM public.projects') = 3, 'admin reads all projects');
SELECT test.assert(test.rows('SELECT * FROM public.project_private_details') = 3, 'admin reads all private details');
SELECT test.assert(test.rows('SELECT * FROM public.quotations') = 2, 'admin reads all quotations');
SELECT test.assert(test.rows('SELECT * FROM public.inspection_reports') = 1, 'admin reads inspection reports');
UPDATE public.users SET role = 'INSPECTOR' WHERE id = :'provider_c';
SELECT test.assert((SELECT role::text FROM public.users WHERE id = :'provider_c') = 'INSPECTOR', 'admin promotes user to INSPECTOR');
RESET ROLE;

\echo '== SECURITY MATRIX PASSED'
