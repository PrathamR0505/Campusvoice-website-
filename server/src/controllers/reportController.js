import { supabase, supabaseAdmin, createScopedClient } from '../config/supabase.js';
import { uploadMedia } from '../services/cloudinaryService.js';
import { analyzeIssueWithGemini } from '../services/aiService.js';
import { findSimilarReports, recordSimilarRelations } from '../services/duplicateDetectionService.js';

export const DEFAULT_CATEGORIES = [
  { id: '9c012969-af78-4d72-be22-2c7fc639ea7b', name: 'Infrastructure', description: 'Buildings, roads, paths, doors, windows, and structural campus elements', icon: 'Building2', color: '#2563EB' },
  { id: '2c915772-ff5c-47dc-991b-58ddd20b0981', name: 'Wi-Fi / Internet', description: 'Campus Wi-Fi connectivity, speed, access points, and LAN ports', icon: 'Wifi', color: '#06B6D4' },
  { id: '914f8003-3b85-4b7a-96c4-f9ed2d6e4615', name: 'Water', description: 'Water dispensers, purifiers, water coolers, and drinking supply', icon: 'Droplet', color: '#0284C7' },
  { id: '39d79fac-0171-4761-8c13-6ab5fcb65223', name: 'Electricity', description: 'Fans, lights, power outlets, switchboards, and air conditioning', icon: 'Zap', color: '#F59E0B' },
  { id: 'd1cc1173-d978-4088-ad31-a4d583a18c91', name: 'Washrooms', description: 'Cleanliness, hygiene, plumbing, sanitation fixtures, and supplies', icon: 'Bath', color: '#8B5CF6' },
  { id: '540758f4-7260-4806-88ce-9ebf84dc6c08', name: 'Classrooms', description: 'Benches, whiteboards, podiums, audio systems, and projectors', icon: 'School', color: '#10B981' },
  { id: '7d90c0c8-481e-40eb-b9b1-f6580c86779e', name: 'Laboratories', description: 'Lab equipment, chemical storage, workstations, and safety kits', icon: 'FlaskConical', color: '#EC4899' },
  { id: '3f57c4de-a52d-4137-b21f-6e720cb2219d', name: 'Canteen', description: 'Food hygiene, canteen seating, water availability, and waste disposal', icon: 'Utensils', color: '#F97316' },
  { id: 'bfe50a78-df7c-47fe-a9eb-9beff6e60884', name: 'Transport', description: 'Campus buses, parking spaces, bicycle stands, and security gates', icon: 'Bus', color: '#6366F1' },
  { id: 'dbc90455-936f-4743-bfd5-88b9f1e34e6a', name: 'Safety', description: 'Fire extinguishers, emergency exits, lighting in dark areas, security', icon: 'ShieldAlert', color: '#EF4444' },
  { id: 'fed62930-46de-4b51-9c6f-844ca593ebc0', name: 'Cleanliness', description: 'Litter, garbage bins, dustbins, hallway sweeping, and waste clearing', icon: 'Sparkles', color: '#14B8A6' },
  { id: '4909bd69-3f16-4735-bbb2-81951e34e70c', name: 'Other', description: 'General campus concerns not covered in predefined categories', icon: 'HelpCircle', color: '#64748B' },
];

export const DEFAULT_LOCATIONS = [
  { id: 'e8f23622-c17a-4f18-bc99-03a961498474', name: 'Main Academic Block A', building: 'Block A', latitude: 12.9716, longitude: 77.5946, description: 'Classrooms 101-404, Dean Office, Faculty Rooms' },
  { id: '35f86d6d-4ebb-4a45-b1a0-126f3ca80b72', name: 'Science & Technology Block B', building: 'Block B', latitude: 12.9722, longitude: 77.5952, description: 'Physics, Chemistry, and Engineering Laboratories' },
  { id: '40698ce8-a264-4725-b3c4-0d2411882529', name: 'Computer Science Block C', building: 'Block C', latitude: 12.9728, longitude: 77.594, description: 'Computing Labs 1-8, AI Research Center, Server Room' },
  { id: '00be375b-99d5-47f1-9192-b92bfbd0b917', name: 'Central Library', building: 'Library Complex', latitude: 12.971, longitude: 77.5935, description: 'Reading Halls, Digital Resource Section, Book Bank' },
  { id: 'e5000f14-108a-44a4-afc7-518aabf1d226', name: 'Student Canteen & Food Court', building: 'Amenities Building', latitude: 12.9705, longitude: 77.5958, description: 'Dining Hall, Juice Corner, Refreshment Stalls' },
  { id: 'f1b79993-13ca-4cf8-9c8a-4567f43a0694', name: 'Indoor Sports Complex & Gym', building: 'Sports Center', latitude: 12.9698, longitude: 77.5942, description: 'Badminton Courts, Gym, Table Tennis, Locker Rooms' },
  { id: '2664646a-b2e0-47b8-adcd-7740341bdd55', name: 'Boys Hostel Block 1', building: 'Hostel Zone', latitude: 12.9735, longitude: 77.5965, description: 'Residential Wing 1, Mess Hall, Laundry Area' },
  { id: 'b234003e-4f13-4683-8171-b75a4a63ca92', name: 'Girls Hostel Block 2', building: 'Hostel Zone', latitude: 12.974, longitude: 77.593, description: 'Residential Wing 2, Common Study Room, Mess Hall' },
  { id: '594db901-5305-49ed-90f1-3b58e0fd0a15', name: 'Campus Health Center', building: 'Medical Wing', latitude: 12.9702, longitude: 77.5925, description: 'First Aid, Doctor Consultation, Emergency Care' },
  { id: '2b321a0f-ca3a-4d8b-8966-29fe01a73aae', name: 'Administrative Block', building: 'Admin Tower', latitude: 12.9714, longitude: 77.596, description: 'Registrar, Accounts Office, Examination Cell' },
  { id: 'other', name: 'Other / Custom Location', building: 'Custom' }
];

const getClient = (req) => {
  if (req.scopedSupabase) return req.scopedSupabase;
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return createScopedClient(token);
  }
  return supabase;
};

/**
 * Fetch categories and locations for form options and filters
 */
export const getFormOptions = async (req, res) => {
  try {
    const client = getClient(req);

    const [categoriesRes, locationsRes] = await Promise.all([
      client.from('categories').select('*').order('name'),
      client.from('locations').select('*').order('name'),
    ]);

    let categories = (categoriesRes.data && categoriesRes.data.length > 0)
      ? categoriesRes.data
      : DEFAULT_CATEGORIES;

    let locations = (locationsRes.data && locationsRes.data.length > 0)
      ? locationsRes.data
      : DEFAULT_LOCATIONS;

    // Ensure "Other / Custom Location" exists in locations list
    if (!locations.some((l) => l.id === 'other' || l.name.toLowerCase().includes('other'))) {
      locations = [...locations, { id: 'other', name: 'Other / Custom Location', building: 'Custom' }];
    }

    return res.status(200).json({
      success: true,
      categories,
      locations,
    });
  } catch (error) {
    console.error('Error fetching form options:', error);
    return res.status(200).json({
      success: true,
      categories: DEFAULT_CATEGORIES,
      locations: DEFAULT_LOCATIONS,
    });
  }
};

/**
 * Create a new campus issue report
 */
export const createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      location_id,
      custom_location,
      latitude,
      longitude,
      incident_date,
      is_anonymous,
      severity,
    } = req.body;

    // 1. Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Issue title is required.' });
    }
    if (!description || description.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a descriptive explanation of at least 15 characters.',
      });
    }

    const studentId = req.user.id;
    const isAnonymousBool = is_anonymous === 'true' || is_anonymous === true;

    // 2. Insert report into database
    const dbClient = getClient(req);
    const OTHER_CATEGORY_UUID = '4909bd69-3f16-4735-bbb2-81951e34e70c';
    const categoryIdPayload = (category_id && category_id !== 'other') ? category_id : OTHER_CATEGORY_UUID;
    const locationIdPayload = (location_id && location_id !== 'other') ? location_id : null;

    const reportPayload = {
      student_id: studentId,
      title: title.trim(),
      description: description.trim(),
      category_id: categoryIdPayload,
      location_id: locationIdPayload,
      custom_location: custom_location ? custom_location.trim() : null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      incident_date: incident_date ? new Date(incident_date).toISOString() : new Date().toISOString(),
      is_anonymous: isAnonymousBool,
      status: 'Reported',
      severity: severity || 'Medium',
      affected_count: 1,
    };

    const { data: newReport, error: reportErr } = await dbClient
      .from('reports')
      .insert(reportPayload)
      .select()
      .single();

    if (reportErr) {
      console.error('Database report insert error:', reportErr);
      return res.status(400).json({ success: false, message: reportErr.message });
    }

    // 3. Upload uploaded files (images/videos) to Cloudinary
    const uploadedMediaList = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const mediaResult = await uploadMedia(
            file.buffer,
            file.originalname,
            file.mimetype,
            'campusvoice/reports'
          );

          let mediaRow = null;
          let mediaErr = null;

          const res1 = await dbClient
            .from('report_media')
            .insert({
              report_id: newReport.id,
              media_type: mediaResult.media_type,
              url: mediaResult.url,
              public_id: mediaResult.public_id,
              uploaded_by: studentId,
            })
            .select()
            .single();

          mediaRow = res1.data;
          mediaErr = res1.error;

          if (mediaErr) {
            console.warn('⚠️ Standard dbClient media insert failed, using admin fallback:', mediaErr.message);
            const res2 = await supabaseAdmin
              .from('report_media')
              .insert({
                report_id: newReport.id,
                media_type: mediaResult.media_type,
                url: mediaResult.url,
                public_id: mediaResult.public_id,
                uploaded_by: studentId,
              })
              .select()
              .single();
            mediaRow = res2.data;
            mediaErr = res2.error;
          }

          if (!mediaErr && mediaRow) {
            uploadedMediaList.push(mediaRow);
          } else if (mediaErr) {
            console.error('❌ Failed to insert report_media row:', mediaErr);
          }
        } catch (uploadError) {
          console.error('Failed to upload file to Cloudinary:', uploadError);
        }
      }
    }

    // 4. Insert initial timeline update
    await dbClient.from('report_updates').insert({
      report_id: newReport.id,
      event_type: 'reported',
      title: 'Issue Documented',
      description: isAnonymousBool
        ? 'Report submitted anonymously by a verified student.'
        : `Report submitted by ${req.profile.full_name}.`,
      actor_id: studentId,
    });

    // 5. Asynchronous AI analysis & Duplicate detection
    (async () => {
      try {
        const aiAnalysis = await analyzeIssueWithGemini(newReport.title, newReport.description, req.files || []);
        
        await supabase
          .from('reports')
          .update({
            ai_category: aiAnalysis.suggested_category,
            ai_issue_type: aiAnalysis.issue_type,
            ai_severity: aiAnalysis.suggested_severity,
            ai_summary: aiAnalysis.summary,
            ai_relevance_score: aiAnalysis.relevance_score,
            ai_analysis: aiAnalysis,
          })
          .eq('id', newReport.id);

        const similarMatches = await findSimilarReports({
          title: newReport.title,
          description: newReport.description,
          category_id: newReport.category_id,
          location_id: newReport.location_id,
          custom_location: newReport.custom_location,
          exclude_id: newReport.id,
        });

        if (similarMatches && similarMatches.length > 0) {
          await recordSimilarRelations(newReport.id, similarMatches);
        }
      } catch (aiErr) {
        console.warn('Background AI processing error:', aiErr.message);
      }
    })();

    return res.status(201).json({
      success: true,
      message: 'Issue report successfully submitted.',
      report: {
        ...newReport,
        media: uploadedMediaList,
      },
    });
  } catch (error) {
    console.error('Create report controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the report.',
    });
  }
};

/**
 * Get all campus reports with filtering, search, and sorting
 */
export const getReports = async (req, res) => {
  try {
    const {
      category_id,
      location_id,
      status,
      search,
      sort_by = 'recent', // 'recent', 'most_affected', 'oldest'
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const dbClient = getClient(req);

    let query = dbClient
      .from('reports')
      .select(`
        *,
        category:categories(id, name, icon, color),
        location:locations(id, name, building, latitude, longitude),
        media:report_media(id, media_type, url, public_id, is_resolution_evidence),
        reporter:profiles(id, full_name, role)
      `, { count: 'exact' });

    // Exclude flagged reports unless user is admin
    if (!req.profile || !['admin', 'moderator'].includes(req.profile.role)) {
      query = query.eq('is_flagged', false);
    }

    // Filters
    if (category_id && category_id !== 'all' && category_id !== 'other') {
      query = query.eq('category_id', category_id);
    }
    if (location_id && location_id !== 'all' && location_id !== 'other') {
      query = query.eq('location_id', location_id);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    // Sorting
    if (sort_by === 'most_affected') {
      query = query.order('affected_count', { ascending: false });
    } else if (sort_by === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: reports, count, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    // Check which reports the current student has supported ("I'm Affected")
    let supportedReportIds = new Set();
    if (req.user) {
      const { data: supports } = await dbClient
        .from('report_support')
        .select('report_id')
        .eq('student_id', req.user.id);
      if (supports) {
        supports.forEach((s) => supportedReportIds.add(s.report_id));
      }
    }

    // Sanitize anonymous reporters for privacy
    const sanitizedReports = (reports || []).map((report) => {
      const isOwner = req.user && req.user.id === report.student_id;
      const isAdmin = req.profile && ['admin', 'moderator'].includes(req.profile.role);
      const isAnon = report.is_anonymous && !isOwner && !isAdmin;

      return {
        ...report,
        reporter: isAnon
          ? { id: 'anonymous', full_name: 'Anonymous Student', role: 'student' }
          : report.reporter,
        hasSupported: supportedReportIds.has(report.id) || isOwner,
      };
    });

    return res.status(200).json({
      success: true,
      reports: sanitizedReports,
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports.',
    });
  }
};

/**
 * Get single report details by ID
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbClient = getClient(req);

    let { data: report, error } = await dbClient
      .from('reports')
      .select(`
        *,
        category:categories(id, name, icon, color),
        location:locations(id, name, building, latitude, longitude),
        media:report_media(id, media_type, url, public_id, is_resolution_evidence, uploaded_by, created_at),
        timeline:report_updates(id, event_type, title, description, old_status, new_status, created_at),
        reporter:profiles(id, full_name, student_id, email, role)
      `)
      .eq('id', id)
      .maybeSingle();

    // Fallback if RLS returns null for unauthenticated read
    if (!report && supabaseAdmin) {
      const { data: fallbackReport } = await supabaseAdmin
        .from('reports')
        .select(`
          *,
          category:categories(id, name, icon, color),
          location:locations(id, name, building, latitude, longitude),
          media:report_media(id, media_type, url, public_id, is_resolution_evidence, uploaded_by, created_at),
          timeline:report_updates(id, event_type, title, description, old_status, new_status, created_at),
          reporter:profiles(id, full_name, student_id, email, role)
        `)
        .eq('id', id)
        .eq('is_flagged', false)
        .maybeSingle();

      if (fallbackReport) {
        report = fallbackReport;
        error = null;
      }
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Fetch comments
    const { data: comments } = await dbClient
      .from('comments')
      .select(`
        id,
        comment_text,
        is_official,
        is_anonymous,
        is_flagged,
        created_at,
        user:profiles(id, full_name, role)
      `)
      .eq('report_id', id)
      .order('created_at', { ascending: true });

    // Fetch student statements ("I'm Affected" statements)
    const { data: statements } = await supabase
      .from('report_support')
      .select(`
        id,
        statement,
        is_anonymous,
        created_at,
        student:profiles(id, full_name)
      `)
      .eq('report_id', id)
      .not('statement', 'is', null)
      .order('created_at', { ascending: false });

    // Check if current user has supported this report
    let hasSupported = false;
    let userFeedback = null;
    if (req.user) {
      const { data: supportRecord } = await supabase
        .from('report_support')
        .select('id')
        .eq('report_id', id)
        .eq('student_id', req.user.id)
        .maybeSingle();

      hasSupported = Boolean(supportRecord) || req.user.id === report.student_id;

      // Check resolution feedback
      const { data: feedbackRecord } = await supabase
        .from('resolution_feedback')
        .select('*')
        .eq('report_id', id)
        .eq('student_id', req.user.id)
        .maybeSingle();

      userFeedback = feedbackRecord;
    }

    // Resolution feedback stats
    const { data: feedbackStats } = await supabase
      .from('resolution_feedback')
      .select('is_resolved');

    const verifiedResolvedCount = feedbackStats?.filter((f) => f.is_resolved).length || 0;
    const stillAnIssueCount = feedbackStats?.filter((f) => !f.is_resolved).length || 0;

    // Sanitize anonymous reporter
    const isOwner = req.user && req.user.id === report.student_id;
    const isAdmin = req.profile && ['admin', 'moderator'].includes(req.profile.role);
    const isAnon = report.is_anonymous && !isOwner && !isAdmin;

    const sanitizedReport = {
      ...report,
      reporter: isAnon
        ? { id: 'anonymous', full_name: 'Anonymous Student', role: 'student' }
        : {
            id: report.reporter?.id,
            full_name: report.reporter?.full_name,
            role: report.reporter?.role,
            student_id: isAdmin || isOwner ? report.reporter?.student_id : undefined,
          },
      hasSupported,
      userFeedback,
      resolutionStats: {
        verifiedResolvedCount,
        stillAnIssueCount,
      },
      comments: (comments || []).map((c) => ({
        ...c,
        user: c.is_anonymous && c.user?.id !== req.user?.id && !isAdmin
          ? { id: 'anonymous', full_name: 'Anonymous Student', role: 'student' }
          : c.user,
      })),
      statements: (statements || []).map((s) => ({
        ...s,
        student: s.is_anonymous && s.student?.id !== req.user?.id && !isAdmin
          ? { full_name: 'Anonymous Student' }
          : s.student,
      })),
    };

    return res.status(200).json({
      success: true,
      report: sanitizedReport,
    });
  } catch (error) {
    console.error('Get report details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve report details.',
    });
  }
};

/**
 * Toggle "I'm Affected by this" button (Student Impact System)
 * Prevents multiple votes from the same authenticated student account
 */
/**
 * Toggle "I'm Affected by this" button (Student Impact System)
 * Prevents multiple votes from the same authenticated student account
 */
export const toggleSupport = async (req, res) => {
  try {
    const { id } = req.params;
    const { statement, is_anonymous } = req.body;
    const studentId = req.user.id;
    const dbClient = getClient(req);

    // Check if report exists
    let { data: report, error: reportErr } = await dbClient
      .from('reports')
      .select('id, student_id, affected_count')
      .eq('id', id)
      .maybeSingle();

    if ((!report || reportErr) && supabaseAdmin) {
      const { data: adminReport } = await supabaseAdmin
        .from('reports')
        .select('id, student_id, affected_count')
        .eq('id', id)
        .maybeSingle();
      if (adminReport) {
        report = adminReport;
        reportErr = null;
      }
    }

    if (reportErr || !report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Reporter is already automatically counted in the affected count
    if (report.student_id === studentId) {
      return res.status(400).json({
        success: false,
        message: 'You originally created this report, so your impact is already counted.',
      });
    }

    // Check if already supported
    const { data: existingSupport } = await dbClient
      .from('report_support')
      .select('id')
      .eq('report_id', id)
      .eq('student_id', studentId)
      .maybeSingle();

    let supported = false;

    if (existingSupport) {
      // Remove support (toggle off)
      await dbClient.from('report_support').delete().eq('id', existingSupport.id);
      supported = false;
    } else {
      // Add support (toggle on)
      const { error: insertErr } = await dbClient.from('report_support').insert({
        report_id: id,
        student_id: studentId,
        statement: statement && statement.trim() ? statement.trim() : null,
        is_anonymous: Boolean(is_anonymous),
      });

      if (insertErr) {
        return res.status(400).json({ success: false, message: insertErr.message });
      }

      supported = true;
    }

    // Fetch refreshed count
    const { data: updatedReport } = await dbClient
      .from('reports')
      .select('affected_count')
      .eq('id', id)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      supported,
      affected_count: updatedReport?.affected_count || report.affected_count,
      message: supported
        ? 'You have verified that you are affected by this issue.'
        : 'Your impact verification has been withdrawn.',
    });
  } catch (error) {
    console.error('Toggle support error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update impact status.',
    });
  }
};

/**
 * Add a comment to an issue
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment_text, is_anonymous } = req.body;
    const dbClient = getClient(req);

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    const isOfficial = req.profile?.role === 'admin';

    const { data: comment, error } = await dbClient
      .from('comments')
      .insert({
        report_id: id,
        user_id: req.user.id,
        comment_text: comment_text.trim(),
        is_official: isOfficial,
        is_anonymous: Boolean(is_anonymous),
      })
      .select(`
        id,
        comment_text,
        is_official,
        is_anonymous,
        created_at,
        user:profiles(id, full_name, role)
      `)
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // If official comment by admin, add timeline entry
    if (isOfficial) {
      await dbClient.from('report_updates').insert({
        report_id: id,
        event_type: 'admin_response',
        title: 'Administration Response Added',
        description: comment_text.trim().substring(0, 150),
        actor_id: req.user.id,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post comment.',
    });
  }
};

/**
 * Delete a comment (own comment or admin)
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const dbClient = getClient(req);

    const { data: comment, error: fetchErr } = await dbClient
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .maybeSingle();

    if (fetchErr || !comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const isOwner = comment.user_id === req.user.id;
    const isAdmin = ['admin', 'moderator'].includes(req.profile?.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    await dbClient.from('comments').delete().eq('id', commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment.',
    });
  }
};
