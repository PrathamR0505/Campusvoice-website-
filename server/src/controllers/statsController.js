import { supabase, supabaseAdmin, createScopedClient, getPublicReadClient } from '../config/supabase.js';
import { getDeletedReportIds } from '../utils/deletedReportsStore.js';

const getClient = async (req, readOnly = false) => {
  if (req.scopedSupabase) return req.scopedSupabase;
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return createScopedClient(token);
  }
  if (readOnly) {
    return await getPublicReadClient();
  }
  return supabase;
};

/**
 * Get dynamic summary statistics for dashboards and landing page
 * Calculates directly from the database - NEVER hardcoded.
 */
export const getStatsSummary = async (req, res) => {
  try {
    const client = await getClient(req, true);
    const deletedIds = getDeletedReportIds();

    // 1. Fetch all reports status and affected_count
    const { data: reports, error: reportsErr } = await client
      .from('reports')
      .select('id, status, affected_count, category_id, location_id, created_at, is_flagged');

    if (reportsErr) {
      console.error('Error fetching reports for stats:', reportsErr);
      return res.status(500).json({ success: false, message: 'Failed to calculate statistics.' });
    }

    const nonFlagged = (reports || []).filter(
      (r) => !deletedIds.has(r.id) && r.status !== 'Deleted' && !r.is_flagged
    );
    const totalReports = nonFlagged.length;
    const openReports = nonFlagged.filter((r) => r.status === 'Reported').length;
    const underReview = nonFlagged.filter((r) => ['Under Review', 'Action Initiated'].includes(r.status)).length;
    const resolvedReports = nonFlagged.filter((r) => r.status === 'Resolved').length;
    const reopenedReports = nonFlagged.filter((r) => r.status === 'Reopened').length;

    // Calculate students affected (sum of affected_count)
    const studentsAffected = nonFlagged.reduce((sum, r) => sum + (r.affected_count || 1), 0);

    // 2. Fetch distinct participating students count (authors + supporters)
    const [profilesCountRes, categoriesRes, locationsRes] = await Promise.all([
      client.from('profiles').select('id', { count: 'exact', head: true }),
      client.from('categories').select('id, name, color, icon'),
      client.from('locations').select('id, name, building'),
    ]);

    const participatingStudents = profilesCountRes.count || 0;

    // Category breakdown
    const categoryMap = {};
    (categoriesRes.data || []).forEach((c) => {
      categoryMap[c.id] = { id: c.id, name: c.name, category_name: c.name, color: c.color, icon: c.icon, count: 0 };
    });

    let otherCategoryCount = 0;
    nonFlagged.forEach((r) => {
      if (r.category_id && categoryMap[r.category_id]) {
        categoryMap[r.category_id].count += 1;
      } else {
        otherCategoryCount += 1;
      }
    });

    if (otherCategoryCount > 0) {
      const otherCat = Object.values(categoryMap).find((c) => c.name.toLowerCase() === 'other');
      if (otherCat) {
        otherCat.count += otherCategoryCount;
      }
    }

    const categoryStats = Object.values(categoryMap).sort((a, b) => b.count - a.count);

    // Location breakdown
    const locationMap = {};
    (locationsRes.data || []).forEach((l) => {
      locationMap[l.id] = { id: l.id, name: l.name, location_name: l.name, building: l.building, count: 0, openCount: 0 };
    });

    let unassignedLocCount = 0;
    let unassignedLocOpenCount = 0;

    nonFlagged.forEach((r) => {
      if (r.location_id && locationMap[r.location_id]) {
        locationMap[r.location_id].count += 1;
        if (r.status !== 'Resolved') {
          locationMap[r.location_id].openCount += 1;
        }
      } else {
        unassignedLocCount += 1;
        if (r.status !== 'Resolved') {
          unassignedLocOpenCount += 1;
        }
      }
    });

    if (unassignedLocCount > 0) {
      locationMap['custom_unassigned'] = {
        id: 'custom_unassigned',
        name: 'Other / Custom Locations',
        location_name: 'Other / Custom Locations',
        building: 'Campus Wide',
        count: unassignedLocCount,
        openCount: unassignedLocOpenCount,
      };
    }

    const locationStats = Object.values(locationMap).sort((a, b) => b.count - a.count);

    // 3. Fetch recent issues (excluding deleted)
    const { data: rawRecentIssues } = await client
      .from('reports')
      .select(`
        id,
        title,
        status,
        affected_count,
        created_at,
        category:categories(name, color),
        location:locations(name)
      `)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false })
      .limit(20);

    const recentIssues = (rawRecentIssues || [])
      .filter((r) => !deletedIds.has(r.id) && r.status !== 'Deleted')
      .slice(0, 6);

    // 4. Fetch trending / high-impact issues (excluding deleted)
    const { data: rawTrendingIssues } = await client
      .from('reports')
      .select(`
        id,
        title,
        status,
        affected_count,
        created_at,
        category:categories(name, color),
        location:locations(name)
      `)
      .eq('is_flagged', false)
      .order('affected_count', { ascending: false })
      .limit(20);

    const trendingIssues = (rawTrendingIssues || [])
      .filter((r) => !deletedIds.has(r.id) && r.status !== 'Deleted')
      .slice(0, 6);

    const activeBacklog = Math.max(0, totalReports - resolvedReports);

    return res.status(200).json({
      success: true,
      stats: {
        totalReports,
        openReports,
        underReview,
        inProgress: underReview,
        activeBacklog,
        resolvedReports,
        reopenedReports,
        studentsAffected,
        participatingStudents,
        resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0,
      },
      categoryStats,
      locationStats,
      recentIssues: recentIssues || [],
      trendingIssues: trendingIssues || [],
    });
  } catch (error) {
    console.error('Stats controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate campus statistics.',
    });
  }
};
