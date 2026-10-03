-- ====================================================================
-- CampusVoice Database Schema
-- Supabase PostgreSQL with Row Level Security & Triggers
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL,
    college_domain TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'moderator')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#2563EB',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    building TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    custom_location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    incident_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'Under Review', 'Action Initiated', 'Resolved', 'Reopened')),
    severity TEXT NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    ai_category TEXT,
    ai_issue_type TEXT,
    ai_severity TEXT,
    ai_summary TEXT,
    ai_relevance_score DOUBLE PRECISION,
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    parent_issue_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    affected_count INTEGER NOT NULL DEFAULT 1,
    supporting_count INTEGER NOT NULL DEFAULT 0,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REPORT MEDIA TABLE (Cloudinary storage references)
CREATE TABLE IF NOT EXISTS public.report_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    url TEXT NOT NULL,
    public_id TEXT,
    is_resolution_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. REPORT SUPPORT TABLE ("I'm affected" & student statements)
CREATE TABLE IF NOT EXISTS public.report_support (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    statement TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(report_id, student_id)
);

-- 7. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    is_official BOOLEAN NOT NULL DEFAULT FALSE,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REPORT UPDATES TABLE (Automated Timeline)
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'reported', 'status_change', 'support_milestone', 'evidence_added', 'admin_response', 'reopened', 'resolved'
    title TEXT NOT NULL,
    description TEXT,
    old_status TEXT,
    new_status TEXT,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ISSUE RELATIONS TABLE (AI Duplicate / Similar Issue Matching)
CREATE TABLE IF NOT EXISTS public.issue_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    target_report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    similarity_score DOUBLE PRECISION NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'potential' CHECK (status IN ('potential', 'merged', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_report_id, target_report_id)
);

-- 10. RESOLUTION FEEDBACK TABLE (Student verification of resolved issues)
CREATE TABLE IF NOT EXISTS public.resolution_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_resolved BOOLEAN NOT NULL, -- TRUE: 'Yes, resolved', FALSE: 'Still an issue'
    feedback_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(report_id, student_id)
);

-- 11. MODERATION REPORTS TABLE (Content safety)
CREATE TABLE IF NOT EXISTS public.moderation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('report', 'comment', 'statement')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    moderator_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'status_change', 'admin_response', 'similar_issue', 'resolution_check', 'support_milestone'
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES for fast queries
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports(location_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_affected_count ON public.reports(affected_count DESC);
CREATE INDEX IF NOT EXISTS idx_report_support_report ON public.report_support(report_id);
CREATE INDEX IF NOT EXISTS idx_report_support_student ON public.report_support(student_id);
CREATE INDEX IF NOT EXISTS idx_comments_report ON public.comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_updates_report ON public.report_updates(report_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Profiles: Public can view profiles, users can update their own profile, service role can manage
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Categories & Locations: Readable by all authenticated, manageable by admins/moderators
CREATE POLICY "Categories viewable by authenticated users" 
ON public.categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Locations viewable by authenticated users" 
ON public.locations FOR SELECT TO authenticated USING (true);

-- Reports: Authenticated students can view all non-flagged reports (or admins view all)
CREATE POLICY "Reports viewable by authenticated users" 
ON public.reports FOR SELECT TO authenticated USING (
    is_flagged = false OR 
    auth.uid() = student_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Students can create reports" 
ON public.reports FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = student_id
);

CREATE POLICY "Students can update their own reports if still Reported" 
ON public.reports FOR UPDATE TO authenticated USING (
    (auth.uid() = student_id AND status = 'Reported') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Report Media: viewable by authenticated, insertable by report owner or admin
CREATE POLICY "Report media viewable by authenticated" 
ON public.report_media FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can upload media to their reports" 
ON public.report_media FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = uploaded_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Report Support: Viewable by authenticated, insertable by student once per report
CREATE POLICY "Report support viewable by authenticated" 
ON public.report_support FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can support reports" 
ON public.report_support FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = student_id
);

CREATE POLICY "Students can withdraw their support" 
ON public.report_support FOR DELETE TO authenticated USING (
    auth.uid() = student_id
);

-- Comments: viewable by authenticated, insertable by authenticated
CREATE POLICY "Comments viewable by authenticated" 
ON public.comments FOR SELECT TO authenticated USING (
    is_flagged = false OR 
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Students can post comments" 
ON public.comments FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Report Updates: Viewable by all authenticated, insertable by server or admin
CREATE POLICY "Timeline updates viewable by authenticated" 
ON public.report_updates FOR SELECT TO authenticated USING (true);

-- Resolution Feedback: Viewable by authenticated, insertable by student once
CREATE POLICY "Resolution feedback viewable by authenticated" 
ON public.resolution_feedback FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can submit resolution feedback" 
ON public.resolution_feedback FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = student_id
);

-- Notifications: Users can only view and update their own notifications
CREATE POLICY "Users view own notifications" 
ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" 
ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- TRIGGER: Auto-confirm user email immediately (prevents email confirmation blockages)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.email_confirmed_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.auto_confirm_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- TRIGGER: Auto-create/update profile on auth.users insert (Supports Email & Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, student_id, college_domain, role, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Student User'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'student_id', 'STU-' || SUBSTRING(new.id::text, 1, 6)),
        SPLIT_PART(new.email, '@', 2),
        'student', -- Default role is student; students cannot self-assign admin
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
    RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRIGGER: Update affected_count on report_support insert/delete
CREATE OR REPLACE FUNCTION public.update_report_affected_count()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.reports
        SET affected_count = (SELECT COUNT(*) + 1 FROM public.report_support WHERE report_id = NEW.report_id),
            updated_at = NOW()
        WHERE id = NEW.report_id;
        
        -- Automatically insert timeline event on support milestone
        IF (SELECT COUNT(*) FROM public.report_support WHERE report_id = NEW.report_id) IN (5, 10, 25, 50, 100, 250, 500) THEN
            INSERT INTO public.report_updates (report_id, event_type, title, description)
            VALUES (
                NEW.report_id, 
                'support_milestone', 
                (SELECT COUNT(*) FROM public.report_support WHERE report_id = NEW.report_id) || ' students affected',
                'Multiple students have verified they are experiencing this campus issue.'
            );
        END IF;
        
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.reports
        SET affected_count = (SELECT COUNT(*) + 1 FROM public.report_support WHERE report_id = OLD.report_id),
            updated_at = NOW()
        WHERE id = OLD.report_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_report_affected_count() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_report_support_change ON public.report_support;
CREATE TRIGGER on_report_support_change
    AFTER INSERT OR DELETE ON public.report_support
    FOR EACH ROW EXECUTE FUNCTION public.update_report_affected_count();

-- SEED DATA FOR CATEGORIES
INSERT INTO public.categories (name, description, icon, color) VALUES
('Infrastructure', 'Buildings, roads, paths, doors, windows, and structural campus elements', 'Building2', '#2563EB'),
('Wi-Fi / Internet', 'Campus Wi-Fi connectivity, speed, access points, and LAN ports', 'Wifi', '#06B6D4'),
('Water', 'Water dispensers, purifiers, water coolers, and drinking supply', 'Droplet', '#0284C7'),
('Electricity', 'Fans, lights, power outlets, switchboards, and air conditioning', 'Zap', '#F59E0B'),
('Washrooms', 'Cleanliness, hygiene, plumbing, sanitation fixtures, and supplies', 'Bath', '#8B5CF6'),
('Classrooms', 'Benches, whiteboards, podiums, audio systems, and projectors', 'School', '#10B981'),
('Laboratories', 'Lab equipment, chemical storage, workstations, and safety kits', 'FlaskConical', '#EC4899'),
('Canteen', 'Food hygiene, canteen seating, water availability, and waste disposal', 'Utensils', '#F97316'),
('Transport', 'Campus buses, parking spaces, bicycle stands, and security gates', 'Bus', '#6366F1'),
('Safety', 'Fire extinguishers, emergency exits, lighting in dark areas, security', 'ShieldAlert', '#EF4444'),
('Cleanliness', 'Litter, garbage bins, dustbins, hallway sweeping, and waste clearing', 'Sparkles', '#14B8A6'),
('Other', 'General campus concerns not covered in predefined categories', 'HelpCircle', '#64748B')
ON CONFLICT (name) DO NOTHING;

-- SEED DATA FOR DEFAULT CAMPUS LOCATIONS
INSERT INTO public.locations (name, building, latitude, longitude, description) VALUES
('Main Academic Block A', 'Block A', 12.9716, 77.5946, 'Classrooms 101-404, Dean Office, Faculty Rooms'),
('Science & Technology Block B', 'Block B', 12.9722, 77.5952, 'Physics, Chemistry, and Engineering Laboratories'),
('Computer Science Block C', 'Block C', 12.9728, 77.5940, 'Computing Labs 1-8, AI Research Center, Server Room'),
('Central Library', 'Library Complex', 12.9710, 77.5935, 'Reading Halls, Digital Resource Section, Book Bank'),
('Student Canteen & Food Court', 'Amenities Building', 12.9705, 77.5958, 'Dining Hall, Juice Corner, Refreshment Stalls'),
('Indoor Sports Complex & Gym', 'Sports Center', 12.9698, 77.5942, 'Badminton Courts, Gym, Table Tennis, Locker Rooms'),
('Boys Hostel Block 1', 'Hostel Zone', 12.9735, 77.5965, 'Residential Wing 1, Mess Hall, Laundry Area'),
('Girls Hostel Block 2', 'Hostel Zone', 12.9740, 77.5930, 'Residential Wing 2, Common Study Room, Mess Hall'),
('Campus Health Center', 'Medical Wing', 12.9702, 77.5925, 'First Aid, Doctor Consultation, Emergency Care'),
('Administrative Block', 'Admin Tower', 12.9714, 77.5960, 'Registrar, Accounts Office, Examination Cell')
ON CONFLICT (name) DO NOTHING;
