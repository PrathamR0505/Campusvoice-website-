import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini API initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Could not initialize Gemini API:', err.message);
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY not configured. Using intelligent semantic heuristic engine as fallback.');
}

/**
 * Intelligent rule-based fallback when Gemini API key is missing
 */
function analyzeHeuristically(title = '', description = '') {
  const combined = `${title} ${description}`.toLowerCase();

  let category = 'Other';
  let issueType = 'General Facility Maintenance';
  let severity = 'Medium';
  let summary = title;

  if (combined.match(/fan|spark|electric|switch|socket|power|short circuit|wire|light|bulb/i)) {
    category = 'Electricity';
    issueType = 'Electrical / Power Supply';
    severity = combined.match(/spark|hazard|shock|short circuit|fire/i) ? 'High' : 'Medium';
    summary = `Electrical condition observed: ${title.substring(0, 70)}`;
  } else if (combined.match(/wifi|internet|network|lan|router|connectivity|speed|signal/i)) {
    category = 'Wi-Fi / Internet';
    issueType = 'Campus Connectivity / Access Point';
    severity = combined.match(/exam|urgent|entire|all|dead zone/i) ? 'High' : 'Medium';
    summary = `Network connectivity disruption reported at location.`;
  } else if (combined.match(/water|cooler|purifier|leak|pipe|dispenser|drinking|tap/i)) {
    category = 'Water';
    issueType = 'Plumbing & Drinking Water Supply';
    severity = combined.match(/overflow|flood|dirty|contamination/i) ? 'High' : 'Medium';
    summary = `Water facility disruption reported.`;
  } else if (combined.match(/washroom|toilet|bathroom|flush|smell|hygiene|drain/i)) {
    category = 'Washrooms';
    issueType = 'Sanitation & Hygiene Fixtures';
    severity = 'High';
    summary = `Sanitation facility requires cleaning and maintenance.`;
  } else if (combined.match(/desk|bench|chair|whiteboard|blackboard|podium|projector|classroom/i)) {
    category = 'Classrooms';
    issueType = 'Classroom Furniture / Equipment';
    severity = 'Medium';
    summary = `Classroom equipment malfunction documented.`;
  } else if (combined.match(/computer|pc|monitor|lab|laboratory|microscope|equipment/i)) {
    category = 'Laboratories';
    issueType = 'Lab Instrumentation / Computer Workstations';
    severity = 'Medium';
    summary = `Laboratory hardware or experiment apparatus issue reported.`;
  } else if (combined.match(/canteen|food|dining|cafeteria|kitchen/i)) {
    category = 'Canteen';
    issueType = 'Food Court / Dining Facilities';
    severity = 'Medium';
    summary = `Canteen hygiene or seating condition reported.`;
  } else if (combined.match(/bus|parking|transport|van|gate/i)) {
    category = 'Transport';
    issueType = 'Campus Commute & Parking';
    severity = 'Low';
    summary = `Campus transport or vehicle parking concern.`;
  } else if (combined.match(/fire|extinguisher|exit|dark|safety|security|lock|danger|theft/i)) {
    category = 'Safety';
    issueType = 'Campus Security & Hazard Prevention';
    severity = 'Critical';
    summary = `Critical safety or hazard risk documented.`;
  } else if (combined.match(/trash|dustbin|garbage|sweep|clean|dirt|litter/i)) {
    category = 'Cleanliness';
    issueType = 'Campus Janitorial & Waste Disposal';
    severity = 'Low';
    summary = `Hallway or campus grounds cleanliness concern.`;
  } else if (combined.match(/door|window|roof|wall|crack|stair|building|road|pothole/i)) {
    category = 'Infrastructure';
    issueType = 'Civil Infrastructure & Structural Elements';
    severity = combined.match(/crack|collapse|broken glass|danger/i) ? 'High' : 'Medium';
    summary = `Campus structural or civil infrastructure issue reported.`;
  }

  return {
    suggested_category: category,
    issue_type: issueType,
    suggested_severity: severity,
    summary,
    image_relevant: true,
    relevance_score: 0.88,
  };
}

/**
 * Analyzes report description and optional media using Gemini AI
 * @param {string} title 
 * @param {string} description 
 * @param {Array<{buffer: Buffer, mimetype: string}>} [files=[]] 
 * @returns {Promise<{suggested_category: string, issue_type: string, suggested_severity: string, summary: string, image_relevant: boolean, relevance_score: number}>}
 */
export const analyzeIssueWithGemini = async (title, description, files = []) => {
  if (!genAI) {
    return analyzeHeuristically(title, description);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert AI Campus Facility Auditor for "CampusVoice" - a student issue reporting platform.
Analyze this student report regarding a facility problem on a college campus.

Title: "${title}"
Description: "${description}"

Categories available on this campus:
- Infrastructure
- Wi-Fi / Internet
- Water
- Electricity
- Washrooms
- Classrooms
- Laboratories
- Canteen
- Transport
- Safety
- Cleanliness
- Other

Output valid JSON matching this exact structure:
{
  "suggested_category": "Exact category name from list above",
  "issue_type": "Short descriptive type, e.g. Electrical / Ceiling Fan or Plumbing / Water Cooler",
  "suggested_severity": "Low | Medium | High | Critical",
  "summary": "1 concise sentence summarizing the documented issue",
  "image_relevant": true,
  "relevance_score": 0.95
}
Do not include any markdown fences or surrounding commentary. Output raw JSON only.
`;

    const parts = [prompt];

    // If an image is provided, include it in the multimodal prompt
    if (files && files.length > 0 && files[0].buffer) {
      const firstFile = files[0];
      if (firstFile.mimetype.startsWith('image/')) {
        parts.push({
          inlineData: {
            data: firstFile.buffer.toString('base64'),
            mimeType: firstFile.mimetype,
          },
        });
      }
    }

    const result = await model.generateContent(parts);
    const text = result.response.text().trim();
    
    // Clean potential markdown quotes
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      suggested_category: parsed.suggested_category || 'Other',
      issue_type: parsed.issue_type || 'Facility Issue',
      suggested_severity: parsed.suggested_severity || 'Medium',
      summary: parsed.summary || title,
      image_relevant: parsed.image_relevant !== false,
      relevance_score: parsed.relevance_score || 0.9,
    };
  } catch (error) {
    console.warn('Gemini API call failed, falling back to heuristic engine:', error.message);
    return analyzeHeuristically(title, description);
  }
};

export default {
  analyzeIssueWithGemini,
};
