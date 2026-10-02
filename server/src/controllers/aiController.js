import { analyzeIssueWithGemini } from '../services/aiService.js';
import { findSimilarReports } from '../services/duplicateDetectionService.js';
import { supabase } from '../config/supabase.js';

/**
 * Pre-submission AI suggestions (Category, Severity, Summary)
 */
export const analyzeDraft = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a title or description for AI analysis.',
      });
    }

    const aiResult = await analyzeIssueWithGemini(title || '', description || '');

    // Map suggested category string to category ID if found
    let matchedCategoryId = null;
    if (aiResult.suggested_category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${aiResult.suggested_category}%`)
        .maybeSingle();

      if (cat) matchedCategoryId = cat.id;
    }

    return res.status(200).json({
      success: true,
      analysis: {
        ...aiResult,
        matched_category_id: matchedCategoryId,
      },
    });
  } catch (error) {
    console.error('AI draft analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze draft with AI.',
    });
  }
};

/**
 * Real-time similar / duplicate issue detector
 * Alerts student: "This issue may already have been reported."
 */
export const checkDuplicateDraft = async (req, res) => {
  try {
    const { title, description, category_id, location_id, custom_location, exclude_id } = req.body;

    if (!title && !description) {
      return res.status(200).json({ success: true, hasSimilar: false, matches: [] });
    }

    const matches = await findSimilarReports({
      title: title || '',
      description: description || '',
      category_id,
      location_id,
      custom_location,
      exclude_id,
    });

    return res.status(200).json({
      success: true,
      hasSimilar: matches.length > 0,
      matches,
    });
  } catch (error) {
    console.error('Duplicate draft check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform similarity check.',
    });
  }
};

/**
 * Get recorded similar issues for an existing report
 */
export const getSimilarIssues = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: relations, error } = await supabase
      .from('issue_relations')
      .select(`
        id,
        similarity_score,
        reason,
        status,
        target_report:reports!issue_relations_target_report_id_fkey(
          id, title, status, affected_count, created_at,
          category:categories(name, color),
          location:locations(name)
        )
      `)
      .eq('source_report_id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      similarIssues: relations || [],
    });
  } catch (error) {
    console.error('Get similar issues error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch similar issues.',
    });
  }
};
