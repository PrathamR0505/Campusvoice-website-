import { supabase } from '../config/supabase.js';

export const seedDemoData = async () => {
  try {
    console.log('🌱 Starting demo data seeding for CampusVoice...');

    // Fetch existing categories & locations
    const [catRes, locRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('locations').select('*'),
    ]);

    const categories = catRes.data || [];
    const locations = locRes.data || [];
    const defaultStudentId = '8d4ca33a-1ee2-4a10-aff0-d80a7391edea'; // Arjun Sharma

    const findCat = (name) => categories.find((c) => c.name.toLowerCase().includes(name.toLowerCase()))?.id;
    const findLoc = (building) => locations.find((l) => l.building?.toLowerCase().includes(building.toLowerCase()))?.id;

    const demoReports = [
      {
        student_id: defaultStudentId,
        title: 'Broken ceiling fan in Room 204',
        description: 'The ceiling fan near the teacher podium in classroom 204 has completely unfastened, sparking occasionally and making loud rattling noises. Students in the front rows are unable to sit safely.',
        category_id: findCat('Electricity'),
        location_id: findLoc('Block B'),
        custom_location: '2nd Floor, Room 204',
        incident_date: new Date(Date.now() - 3 * 86400000).toISOString(),
        is_anonymous: false,
        status: 'Action Initiated',
        severity: 'High',
        ai_category: 'Electricity',
        ai_issue_type: 'Electrical / Ceiling Fan',
        ai_severity: 'High',
        ai_summary: 'Non-operational ceiling fan sparking near the front podium.',
        affected_count: 67,
        is_demo: true,
      },
      {
        student_id: defaultStudentId,
        title: 'Wi-Fi completely unavailable in Block C Study Area',
        description: 'The access points on the 3rd floor of Block C have been showing red status lights since Monday. Over 50 students preparing for semester practical exams cannot access digital learning materials.',
        category_id: findCat('Wi-Fi'),
        location_id: findLoc('Block C'),
        custom_location: '3rd Floor, West Wing Study Area',
        incident_date: new Date(Date.now() - 2 * 86400000).toISOString(),
        is_anonymous: false,
        status: 'Under Review',
        severity: 'High',
        ai_category: 'Wi-Fi / Internet',
        ai_issue_type: 'Campus Network / AP Failure',
        ai_severity: 'High',
        ai_summary: 'Wireless access point failure in Block C reading hall.',
        affected_count: 183,
        is_demo: true,
      },
      {
        student_id: defaultStudentId,
        title: 'Laboratory computers not functioning in Computing Lab 3',
        description: 'Out of 30 computer workstations in Computing Lab 3, only 18 were functional during today\'s database practical. 12 systems fail to boot beyond BIOS screen.',
        category_id: findCat('Laboratories'),
        location_id: findLoc('Block C'),
        custom_location: 'Computing Lab 3, Ground Floor',
        incident_date: new Date(Date.now() - 4 * 86400000).toISOString(),
        is_anonymous: true,
        status: 'Reported',
        severity: 'Medium',
        ai_category: 'Laboratories',
        ai_issue_type: 'Lab Hardware Malfunction',
        ai_severity: 'Medium',
        ai_summary: '12 workstation computers failing to boot during practicals.',
        affected_count: 42,
        is_demo: true,
      },
      {
        student_id: defaultStudentId,
        title: 'Water dispenser purifier filter overdue in Amenities Canteen',
        description: 'The drinking water cooler in the central student canteen is dispensing discolored water with a metallic taste. The filter replacement tag shows last service was 8 months ago.',
        category_id: findCat('Water'),
        location_id: findLoc('Amenities'),
        custom_location: 'Central Canteen Dining Area',
        incident_date: new Date(Date.now() - 5 * 86400000).toISOString(),
        is_anonymous: false,
        status: 'Resolved',
        severity: 'High',
        ai_category: 'Water',
        ai_issue_type: 'Plumbing & Drinking Water Purifier',
        ai_severity: 'High',
        ai_summary: 'Water dispenser requiring filter replacement and sanitation.',
        affected_count: 124,
        is_demo: true,
      },
      {
        student_id: defaultStudentId,
        title: 'Washroom plumbing maintenance issue in Block A 2nd Floor',
        description: 'The second floor male washroom in Block A has a leaking sink tap creating water pool on tiles, making the walkway slippery.',
        category_id: findCat('Washrooms'),
        location_id: findLoc('Block A'),
        custom_location: '2nd Floor Restroom',
        incident_date: new Date(Date.now() - 1 * 86400000).toISOString(),
        is_anonymous: true,
        status: 'Reported',
        severity: 'Medium',
        ai_category: 'Washrooms',
        ai_issue_type: 'Sanitation & Plumbing Fixture',
        ai_severity: 'Medium',
        ai_summary: 'Leaking sink tap causing wet floor hazard.',
        affected_count: 29,
        is_demo: true,
      },
      {
        student_id: defaultStudentId,
        title: 'Broken classroom benches & damaged writing desks in Room 102',
        description: 'Three wooden desk rows in Lecture Hall 102 have broken armrests and loose nails exposed, causing torn backpacks and clothing.',
        category_id: findCat('Classrooms'),
        location_id: findLoc('Block A'),
        custom_location: 'Room 102, 1st Floor',
        incident_date: new Date(Date.now() - 6 * 86400000).toISOString(),
        is_anonymous: false,
        status: 'Resolved',
        severity: 'Low',
        ai_category: 'Classrooms',
        ai_issue_type: 'Classroom Furniture',
        ai_severity: 'Low',
        ai_summary: 'Damaged wooden benches and loose nails in Room 102.',
        affected_count: 15,
        is_demo: true,
      },
    ];

    const { data: inserted, error } = await supabase
      .from('reports')
      .insert(demoReports)
      .select();

    if (error) {
      console.error('Seeding error:', error);
    } else {
      console.log(`✅ Successfully seeded ${inserted.length} realistic demo campus reports!`);
    }
  } catch (err) {
    console.error('Failed to seed demo data:', err);
  }
};

export const clearDemoData = async () => {
  try {
    const { error } = await supabase.from('reports').delete().eq('is_demo', true);
    if (error) {
      console.error('Error clearing demo data:', error);
    } else {
      console.log('🧹 All demo reports successfully removed from database.');
    }
  } catch (err) {
    console.error('Clear demo error:', err);
  }
};

if (process.argv[2] === '--clear') {
  clearDemoData();
} else if (process.argv[2] === '--seed') {
  seedDemoData();
}
