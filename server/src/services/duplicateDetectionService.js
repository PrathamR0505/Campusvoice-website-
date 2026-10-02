import { supabase } from '../config/supabase.js';

// English stop words for cleaning
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'there', 'this', 'our', 'my',
  'has', 'have', 'had', 'been', 'near', 'by', 'very', 'not', 'no'
]);

/**
 * Clean and extract unique keywords / n-grams
 */
function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Calculate Jaccard similarity coefficient between two token sets
 */
function jaccardSimilarity(tokens1, tokens2) {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersection = 0;
  set1.forEach((val) => {
    if (set2.has(val)) intersection++;
  });

  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check room number or alphanumeric token match (e.g. '204', '301', 'lab2')
 */
function hasSharedRoomNumber(loc1 = '', loc2 = '') {
  if (!loc1 || !loc2) return false;
  const numbers1 = loc1.match(/\b\d+[a-z]?\b/gi) || [];
  const numbers2 = loc2.match(/\b\d+[a-z]?\b/gi) || [];

  return numbers1.some((n1) => numbers2.includes(n1));
}

/**
 * Compares an incoming report draft with existing active reports
 * Returns array of matches with similarity score (0.0 to 1.0) and reasoning
 * @param {{title: string, description: string, category_id?: string, location_id?: string, custom_location?: string, exclude_id?: string}} newReport 
 * @returns {Promise<Array<{report: any, score: number, confidence: 'high'|'medium'|'low', reason: string}>>}
 */
export const findSimilarReports = async (newReport) => {
  try {
    // 1. Fetch active reports from database
    let query = supabase
      .from('reports')
      .select(`
        id,
        title,
        description,
        status,
        affected_count,
        category_id,
        location_id,
        custom_location,
        created_at,
        category:categories(name, color),
        location:locations(name, building),
        media:report_media(url, media_type)
      `)
      .neq('status', 'Resolved'); // Compare against open/active reports

    if (newReport.exclude_id) {
      query = query.neq('id', newReport.exclude_id);
    }

    const { data: existingReports, error } = await query;
    if (error || !existingReports || existingReports.length === 0) {
      return [];
    }

    const newTitleTokens = tokenize(newReport.title);
    const newDescTokens = tokenize(newReport.description);

    const matches = [];

    for (const report of existingReports) {
      const existingTitleTokens = tokenize(report.title);
      const existingDescTokens = tokenize(report.description);

      // 1. Text Similarity (0.0 to 1.0)
      const titleSim = jaccardSimilarity(newTitleTokens, existingTitleTokens);
      const descSim = jaccardSimilarity(newDescTokens, existingDescTokens);

      let score = titleSim * 0.45 + descSim * 0.25;

      const reasons = [];

      // 2. Category Match
      if (newReport.category_id && newReport.category_id === report.category_id) {
        score += 0.15;
        reasons.push('Same facility category');
      }

      // 3. Location Match
      if (newReport.location_id && newReport.location_id === report.location_id) {
        score += 0.15;
        reasons.push('Same campus building');
      }

      // 4. Exact Room Number match
      if (hasSharedRoomNumber(newReport.custom_location, report.custom_location) ||
          hasSharedRoomNumber(newReport.title, report.title)) {
        score += 0.25;
        reasons.push('Shared room/hall identifier');
      }

      // Cap at 0.99
      const normalizedScore = Math.min(Math.round(score * 100) / 100, 0.99);

      if (normalizedScore >= 0.40) {
        let confidence = 'low';
        if (normalizedScore >= 0.70) confidence = 'high';
        else if (normalizedScore >= 0.50) confidence = 'medium';

        matches.push({
          report,
          score: normalizedScore,
          confidence,
          reason: reasons.length > 0
            ? reasons.join(' • ')
            : 'Substantial vocabulary overlap regarding documented issue',
        });
      }
    }

    // Sort by highest score first
    return matches.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return [];
  }
};

/**
 * Persist detected similar issue relations into Supabase issue_relations table
 */
export const recordSimilarRelations = async (newReportId, matches) => {
  if (!matches || matches.length === 0) return;

  const records = matches.slice(0, 3).map((m) => ({
    source_report_id: newReportId,
    target_report_id: m.report.id,
    similarity_score: m.score,
    reason: m.reason,
    status: m.confidence === 'high' ? 'potential' : 'potential',
  }));

  try {
    await supabase.from('issue_relations').upsert(records, {
      onConflict: 'source_report_id, target_report_id',
    });
  } catch (err) {
    console.error('Error recording issue relations:', err);
  }
};

export default {
  findSimilarReports,
  recordSimilarRelations,
};
