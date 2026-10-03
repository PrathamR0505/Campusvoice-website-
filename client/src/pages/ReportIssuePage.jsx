import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ImageUploader from '../components/reports/ImageUploader';
import { 
  Megaphone, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Sparkles
} from 'lucide-react';

export default function ReportIssuePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('12:00');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState([]);
  
  const DEFAULT_CATEGORIES = [
    { id: '9c012969-af78-4d72-be22-2c7fc639ea7b', name: 'Infrastructure' },
    { id: '2c915772-ff5c-47dc-991b-58ddd20b0981', name: 'Wi-Fi / Internet' },
    { id: '914f8003-3b85-4b7a-96c4-f9ed2d6e4615', name: 'Water' },
    { id: '39d79fac-0171-4761-8c13-6ab5fcb65223', name: 'Electricity' },
    { id: 'd1cc1173-d978-4088-ad31-a4d583a18c91', name: 'Washrooms' },
    { id: '540758f4-7260-4806-88ce-9ebf84dc6c08', name: 'Classrooms' },
    { id: '7d90c0c8-481e-40eb-b9b1-f6580c86779e', name: 'Laboratories' },
    { id: '3f57c4de-a52d-4137-b21f-6e720cb2219d', name: 'Canteen' },
    { id: 'bfe50a78-df7c-47fe-a9eb-9beff6e60884', name: 'Transport' },
    { id: 'dbc90455-936f-4743-bfd5-88b9f1e34e6a', name: 'Safety' },
    { id: 'fed62930-46de-4b51-9c6f-844ca593ebc0', name: 'Cleanliness' },
    { id: '4909bd69-3f16-4735-bbb2-81951e34e70c', name: 'Other' },
  ];

  const DEFAULT_LOCATIONS = [
    { id: 'e8f23622-c17a-4f18-bc99-03a961498474', name: 'Main Academic Block A', building: 'Block A' },
    { id: '35f86d6d-4ebb-4a45-b1a0-126f3ca80b72', name: 'Science & Technology Block B', building: 'Block B' },
    { id: '40698ce8-a264-4725-b3c4-0d2411882529', name: 'Computer Science Block C', building: 'Block C' },
    { id: '00be375b-99d5-47f1-9192-b92bfbd0b917', name: 'Central Library', building: 'Library Complex' },
    { id: 'e5000f14-108a-44a4-afc7-518aabf1d226', name: 'Student Canteen & Food Court', building: 'Amenities Building' },
    { id: 'f1b79993-13ca-4cf8-9c8a-4567f43a0694', name: 'Indoor Sports Complex & Gym', building: 'Sports Center' },
    { id: '2664646a-b2e0-47b8-adcd-7740341bdd55', name: 'Boys Hostel Block 1', building: 'Hostel Zone' },
    { id: 'b234003e-4f13-4683-8171-b75a4a63ca92', name: 'Girls Hostel Block 2', building: 'Hostel Zone' },
    { id: '594db901-5305-49ed-90f1-3b58e0fd0a15', name: 'Campus Health Center', building: 'Medical Wing' },
    { id: '2b321a0f-ca3a-4d8b-8966-29fe01a73aae', name: 'Administrative Block', building: 'Admin Tower' },
    { id: 'other', name: 'Other / Custom Location', building: 'Custom' },
  ];

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);

  // AI & Duplicate Detection State
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [dismissDuplicates, setDismissDuplicates] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const res = await api.get('/reports/options');
        if (res.categories && res.categories.length > 0) setCategories(res.categories);
        if (res.locations && res.locations.length > 0) setLocations(res.locations);
      } catch (err) {
        console.warn('Could not refresh form options from server, using defaults:', err);
      }
    }
    loadFormOptions();
  }, []);

  // Debounced Real-Time Duplicate & Similarity Check
  useEffect(() => {
    if (title.trim().length < 8 && description.trim().length < 15) {
      setDuplicateMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/ai/check-duplicates', {
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
          location_id: locationId,
          custom_location: customLocation,
        });

        if (res.hasSimilar && res.matches) {
          setDuplicateMatches(res.matches);
        } else {
          setDuplicateMatches([]);
        }
      } catch (e) {
        console.warn('Duplicate check error:', e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, description, categoryId, locationId, customLocation]);

  const handleAIAnalyze = async () => {
    if (!title.trim() && !description.trim()) {
      setError('Please type a title or description first before running AI analysis.');
      return;
    }

    setError('');
    setAnalyzingAI(true);

    try {
      const res = await api.post('/ai/analyze-draft', {
        title: title.trim(),
        description: description.trim(),
      });

      if (res.analysis) {
        setAiSuggestion(res.analysis);
        if (res.analysis.matched_category_id && !categoryId) {
          setCategoryId(res.analysis.matched_category_id);
        }
      }
    } catch (err) {
      setError('AI analysis service temporarily unavailable.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title for this issue.');
      return;
    }
    if (description.trim().length < 15) {
      setError('Description must be at least 15 characters to provide enough context.');
      return;
    }
    if (!categoryId) {
      setError('Please select a facility category.');
      return;
    }
    if (locationId === 'other' && !customLocation.trim()) {
      setError('Please type the custom location or landmark name.');
      return;
    }
    if (!locationId && !customLocation.trim()) {
      setError('Please select a campus location or enter an exact location.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category_id', categoryId);
      if (locationId) formData.append('location_id', locationId);
      if (customLocation) formData.append('custom_location', customLocation.trim());
      
      const fullDate = new Date(`${incidentDate}T${incidentTime}:00`);
      formData.append('incident_date', fullDate.toISOString());
      formData.append('is_anonymous', isAnonymous ? 'true' : 'false');

      files.forEach((f) => {
        formData.append('media', f.file);
      });

      const res = await api.post('/reports', formData);

      setSuccess(true);
      setTimeout(() => {
        if (res.report?.id) {
          navigate(`/issue/${res.report.id}`);
        } else {
          navigate('/feed');
        }
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit issue report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans min-h-[calc(100vh-4rem)] flex-1 flex flex-col justify-center bg-[#09090b] text-white">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-semibold uppercase tracking-wider mb-2 font-sans">
          <Megaphone className="w-3.5 h-3.5 text-white" />
          <span>New Campus Facility Report</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-tight">
          Document an Issue
        </h1>
        <p className="font-sans text-sm text-zinc-400 mt-1 font-normal">
          Provide accurate photos and details. Gemini AI assists with categorization and checks for duplicate reports in real-time.
        </p>
      </div>

      {/* AUTOMATIC SIMILAR / DUPLICATE ISSUE DETECTION ALERT */}
      {duplicateMatches.length > 0 && !dismissDuplicates && (
        <div className="mb-8 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-md space-y-4 font-sans text-zinc-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
              <span>This issue may already have been reported.</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {duplicateMatches.length} Possible Match{duplicateMatches.length > 1 ? 'es' : ''}
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-normal">
            Our duplicate detection system identified existing student reports that closely match your description. Supporting an existing report unites student impact into one high-priority report.
          </p>

          <div className="space-y-3 pt-1">
            {duplicateMatches.slice(0, 2).map((match, idx) => (
              <div
                key={match.report.id || idx}
                className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                      {match.report.category?.name || 'Facility'}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      📍 {match.report.location?.name} {match.report.custom_location ? `(${match.report.custom_location})` : ''}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{match.report.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 font-normal">{match.report.description}</p>
                </div>

                <Link
                  to={`/issue/${match.report.id}`}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors flex-shrink-0 text-center cursor-pointer"
                >
                  View Existing Issue →
                </Link>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400">
              If your report is for a separate facility or room, you can proceed below.
            </span>
            <button
              type="button"
              onClick={() => setDismissDuplicates(true)}
              className="text-white font-bold hover:underline cursor-pointer"
            >
              Dismiss & Continue
            </button>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-[#121214] rounded-2xl border border-zinc-800 shadow-xl p-6 sm:p-8 font-sans">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm flex items-start gap-2.5 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm flex items-start gap-2.5 font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
            <span>Report successfully submitted! Redirecting to issue page...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & AI Analyze Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Issue Title <span className="text-red-400">*</span>
              </label>

              <button
                type="button"
                onClick={handleAIAnalyze}
                disabled={analyzingAI || (!title.trim() && !description.trim())}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>{analyzingAI ? 'Gemini Analyzing...' : '✨ Analyze with Gemini AI'}</span>
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="e.g. Broken ceiling fan in Room 204 or Water cooler leaking in Block B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all placeholder:text-zinc-600 font-medium"
            />
          </div>

          {/* AI Suggestion Display Box */}
          {aiSuggestion && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Gemini AI Facility Suggestion</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                "{aiSuggestion.summary}"
              </p>
            </div>
          )}

          {/* Category & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Facility Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all font-medium"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Campus Location <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all font-medium"
              >
                <option value="">Select campus zone/building...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.building})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exact Room / Location Details */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Specific Room, Floor, or Landmark
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required={locationId === 'other'}
                placeholder="e.g. 2nd Floor, Room 204, near the east staircase"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all placeholder:text-zinc-600 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Detailed Description <span className="text-red-400">*</span>
              </label>
              <span className={`text-[11px] font-medium ${
                description.length < 15 ? 'text-zinc-500' : 'text-white'
              }`}>
                {description.length}/15 min chars
              </span>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Describe the condition, how long it has persisted, safety risks, or number of students prevented from using the facility..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all placeholder:text-zinc-600 leading-relaxed font-normal"
            />
          </div>

          {/* Date & Time Observed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Date Observed
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Approximate Time
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Photo & Video Attachment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Photo or Video Evidence (Max 25 MB per file, auto-compressed)
            </label>
            <ImageUploader files={files} setFiles={setFiles} />
          </div>

          {/* Anonymous Checkbox */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs font-bold text-white">Submit Anonymously</p>
                <p className="text-[11px] text-zinc-400 font-normal">
                  Your student identity remains private while administration addresses the report.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 text-white focus:ring-zinc-400 bg-zinc-900 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-sans font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-zinc-950" />
              <span>{submitting ? 'Submitting Report...' : 'Submit Campus Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
