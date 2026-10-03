import { supabase, supabaseAdmin, createScopedClient, getPublicReadClient } from '../config/supabase.js';
import { uploadMedia } from '../services/cloudinaryService.js';
import { DEFAULT_CATEGORIES, DEFAULT_LOCATIONS } from './reportController.js';
import { addDeletedReportId, getDeletedReportIds } from '../utils/deletedReportsStore.js';

const getClient = async (req) => {
  if (req.scopedSupabase) return req.scopedSupabase;
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return createScopedClient(token);
  }
  return await getPublicReadClient();
};

/**
 * Get comprehensive admin statistics, status distribution, and actionable alerts
 */
export const getAdminOverview = async (req, res) => {
  try {
    const client = await getPublicReadClient();

    const [reportsRes, categoriesRes, locationsRes, moderationRes, feedbackRes] = await Promise.all([
      client.from('reports').select(`
        *,
        category:categories(id, name, color, icon),
        location:locations(id, name, building),
        reporter:profiles(id, full_name, email, student_id)
      `).order('created_at', { ascending: false }),
      client.from('categories').select('*'),
      client.from('locations').select('*'),
      client.from('moderation_reports').select('*').eq('status', 'pending'),
      client.from('resolution_feedback').select('*'),
    ]);

    if (reportsRes.error) {
      console.error('Error fetching admin reports:', reportsRes.error);
    }

    let rawReports = reportsRes.data || [];
    const deletedIds = getDeletedReportIds();

    // Filter out permanently deleted reports
    rawReports = rawReports.filter((r) => !deletedIds.has(r.id) && r.status !== 'Deleted' && !r.is_flagged);

    // Enrich reports with category and location fallbacks if relationships return null
    const reports = rawReports.map((r) => {
      let category = r.category;
      if (!category && r.category_id) {
        const defaultCat = DEFAULT_CATEGORIES.find((c) => c.id === r.category_id);
        if (defaultCat) {
          category = { id: defaultCat.id, name: defaultCat.name, color: defaultCat.color, icon: defaultCat.icon };
        }
      }

      let location = r.location;
      if (!location && r.location_id) {
        const defaultLoc = DEFAULT_LOCATIONS.find((l) => l.id === r.location_id);
        if (defaultLoc) {
          location = { id: defaultLoc.id, name: defaultLoc.name, building: defaultLoc.building };
        }
      }

      return {
        ...r,
        description: r.description || '',
        category,
        location,
      };
    });

    const totalReports = reports.length;
    const openReports = reports.filter((r) => r.status === 'Reported').length;
    const underReviewReports = reports.filter((r) => r.status === 'Under Review').length;
    const actionInitiatedReports = reports.filter((r) => r.status === 'Action Initiated').length;
    const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
    const reopenedReports = reports.filter((r) => r.status === 'Reopened').length;

    const totalAffected = reports.reduce((sum, r) => sum + (r.affected_count || 1), 0);

    // Calculate resolution feedback statistics
    const allFeedbacks = feedbackRes.data || [];
    const satisfiedResolutions = allFeedbacks.filter((f) => f.is_resolved).length;
    const disputedResolutions = allFeedbacks.filter((f) => !f.is_resolved).length;

    const categories = (categoriesRes.data && categoriesRes.data.length > 0)
      ? categoriesRes.data
      : DEFAULT_CATEGORIES;

    const locations = (locationsRes.data && locationsRes.data.length > 0)
      ? locationsRes.data
      : DEFAULT_LOCATIONS;

    return res.status(200).json({
      success: true,
      stats: {
        totalReports,
        openReports,
        underReviewReports,
        actionInitiatedReports,
        resolvedReports,
        reopenedReports,
        totalAffected,
        pendingModeration: moderationRes.data?.length || 0,
        satisfiedResolutions,
        disputedResolutions,
      },
      reports,
      categories,
      locations,
      moderationQueue: moderationRes.data || [],
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative overview.',
    });
  }
};

/**
 * Update report status (Reported, Under Review, Action Initiated, Resolved, Reopened)
 * Automatically creates timeline entry and notifications
 */
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const adminId = req.user.id;
    const client = await getPublicReadClient();

    const validStatuses = ['Reported', 'Under Review', 'Action Initiated', 'Resolved', 'Reopened'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // 1. Fetch existing report
    const { data: report, error: fetchErr } = await client
      .from('reports')
      .select('id, title, status, student_id')
      .eq('id', id)
      .single();

    if (fetchErr || !report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const oldStatus = report.status;

    // 2. Update report status in database
    const { data: updatedReport, error: updateErr } = await client
      .from('reports')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(400).json({ success: false, message: updateErr.message });
    }

    // 3. Handle Resolution Evidence Upload if attached
    let resolutionEvidenceRow = null;
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const mediaResult = await uploadMedia(
            file.buffer,
            file.originalname,
            file.mimetype,
            'campusvoice/resolution_evidence'
          );

          const { data: mRow } = await client
            .from('report_media')
            .insert({
              report_id: id,
              media_type: mediaResult.media_type,
              url: mediaResult.url,
              public_id: mediaResult.public_id,
              is_resolution_evidence: true,
              uploaded_by: adminId,
            })
            .select()
            .single();

          if (mRow) resolutionEvidenceRow = mRow;
        } catch (uploadError) {
          console.error('Failed to upload resolution evidence:', uploadError);
        }
      }
    }

    // 4. Automatically add status change to timeline (Requirement 10 & 12)
    const timelineTitles = {
      'Under Review': '🟡 Administration Under Review',
      'Action Initiated': '🔵 Action Initiated by Campus Maintenance',
      'Resolved': '🟢 Issue Marked Resolved',
      'Reopened': '⚠️ Issue Reopened for Further Rectification',
      'Reported': '🔴 Status Reset to Reported',
    };

    const defaultNotes = {
      'Under Review': 'Campus facilities administration is actively assessing the repair requirements.',
      'Action Initiated': 'Work order has been dispatched to campus technicians.',
      'Resolved': 'Technicians have concluded maintenance. Awaiting student verification.',
      'Reopened': 'Facility problem has reoccurred or students verified persistent malfunction.',
      'Reported': 'Report placed in queue.',
    };

    await client.from('report_updates').insert({
      report_id: id,
      event_type: status === 'Resolved' ? 'resolved' : status === 'Reopened' ? 'reopened' : 'status_change',
      title: timelineTitles[status] || `Status updated to ${status}`,
      description: note && note.trim() ? note.trim() : defaultNotes[status],
      old_status: oldStatus,
      new_status: status,
      actor_id: adminId,
    });

    // 5. Notify reporter and supporters (Requirement 20)
    // Find all supporters
    const { data: supporters } = await client
      .from('report_support')
      .select('student_id')
      .eq('report_id', id);

    const userIdsToNotify = new Set([report.student_id]);
    if (supporters) {
      supporters.forEach((s) => userIdsToNotify.add(s.student_id));
    }

    const notifications = Array.from(userIdsToNotify).map((uid) => ({
      user_id: uid,
      title: `Issue Status Update: ${status}`,
      message: `The issue "${report.title}" was updated from "${oldStatus}" to "${status}". ${note ? `Note: ${note}` : ''}`,
      type: status === 'Resolved' ? 'resolution_check' : 'status_change',
      report_id: id,
    }));

    await client.from('notifications').insert(notifications);

    return res.status(200).json({
      success: true,
      message: `Issue status successfully updated to ${status}.`,
      report: updatedReport,
      resolutionEvidence: resolutionEvidenceRow,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update report status.',
    });
  }
};

/**
 * Upload resolution photographic evidence directly
 */
export const uploadResolutionEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const adminId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please attach evidence photos or video.' });
    }

    const uploadedEvidence = [];
    for (const file of req.files) {
      const mediaResult = await uploadMedia(
        file.buffer,
        file.originalname,
        file.mimetype,
        'campusvoice/resolution_evidence'
      );

      const { data: mediaRow } = await supabase
        .from('report_media')
        .insert({
          report_id: id,
          media_type: mediaResult.media_type,
          url: mediaResult.url,
          public_id: mediaResult.public_id,
          is_resolution_evidence: true,
          uploaded_by: adminId,
        })
        .select()
        .single();

      if (mediaRow) uploadedEvidence.push(mediaRow);
    }

    // Add timeline event
    await supabase.from('report_updates').insert({
      report_id: id,
      event_type: 'evidence_added',
      title: 'Resolution Evidence Uploaded',
      description: note || 'Administration uploaded photographic confirmation of completed repairs.',
      actor_id: adminId,
    });

    return res.status(200).json({
      success: true,
      message: 'Resolution evidence uploaded successfully.',
      evidence: uploadedEvidence,
    });
  } catch (error) {
    console.error('Upload resolution evidence error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload resolution evidence.',
    });
  }
};

/**
 * Student Resolution Verification (Requirement 13)
 * "Has this issue actually been resolved?"
 * Buttons: ✅ Yes, resolved / ❌ Still an issue
 */
export const submitResolutionFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_resolved, feedback_note } = req.body;
    const studentId = req.user.id;

    const { data: report, error: reportErr } = await supabase
      .from('reports')
      .select('id, title, status')
      .eq('id', id)
      .single();

    if (reportErr || !report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Upsert resolution feedback (1 verification per student)
    const { data: feedback, error: feedbackErr } = await supabase
      .from('resolution_feedback')
      .upsert({
        report_id: id,
        student_id: studentId,
        is_resolved: Boolean(is_resolved),
        feedback_note: feedback_note ? feedback_note.trim() : null,
      }, { onConflict: 'report_id, student_id' })
      .select()
      .single();

    if (feedbackErr) {
      return res.status(400).json({ success: false, message: feedbackErr.message });
    }

    // Check if multiple students have reported "Still an issue"
    const { data: allDisputes } = await supabase
      .from('resolution_feedback')
      .select('id')
      .eq('report_id', id)
      .eq('is_resolved', false);

    const disputeCount = allDisputes?.length || 0;

    // If 2 or more students verify the issue is still active, automatically append a timeline warning
    if (!is_resolved && disputeCount >= 2) {
      await supabase.from('report_updates').insert({
        report_id: id,
        event_type: 'reopened',
        title: '⚠️ Student Resolution Dispute Flagged',
        description: `${disputeCount} verified students have indicated that this issue persists despite being marked resolved. Administration review requested.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Your verification feedback has been documented.',
      feedback,
      disputeCount,
    });
  } catch (error) {
    console.error('Submit resolution feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record resolution feedback.',
    });
  }
};

/**
 * Permanently delete a report and all its associated data (Admin only)
 */
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Report ID is required.' });
    }

    // Permanently record deletion in persistent store so report disappears everywhere
    addDeletedReportId(id);

    // Perform database cleanups safely using scoped/admin client first, then fallback clients
    const clientsToTry = [req.scopedSupabase, supabaseAdmin, supabase].filter(Boolean);
    for (const client of clientsToTry) {
      try {
        await client.from('report_media').delete().eq('report_id', id);
        await client.from('report_updates').delete().eq('report_id', id);
        await client.from('report_support').delete().eq('report_id', id);
        await client.from('comments').delete().eq('report_id', id);
        await client.from('resolution_feedback').delete().eq('report_id', id);
        await client.from('notifications').delete().eq('report_id', id);
        await client.from('reports').delete().eq('id', id);
        await client.from('reports').update({ is_flagged: true }).eq('id', id);
        break;
      } catch (dbErr) {
        console.warn('DB delete cascade notice:', dbErr?.message || dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Report was permanently deleted.',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete report.',
    });
  }
};
