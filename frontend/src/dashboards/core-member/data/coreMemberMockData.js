export const departmentSummary = {
  name: 'Marketing & Communications',
  role: 'Department Head',
  welcomeMessage: 'Welcome back, Maya. Here is what needs your attention this week.',
};

export const profile = {
  name: 'Maya Chen',
  role: 'Department Head',
  department: departmentSummary.name,
};

export const tasks = [
  {
    id: 'task-1',
    title: 'Finalize welcome mixer campaign',
    description: 'Review the event copy, confirm the visual assets, and schedule the final campaign across student channels.',
    owner: 'Maya Chen',
    dueDate: '2026-10-09',
    priority: 'High',
    status: 'In progress',
    progress: 70,
  },
  {
    id: 'task-2',
    title: 'Approve campus fair photo selects',
    description: 'Choose the approved photo set and send the final selections to the campus fair communications lead.',
    owner: 'Maya Chen',
    dueDate: '2026-10-12',
    priority: 'High',
    status: 'Review',
    progress: 90,
  },
  {
    id: 'task-3',
    title: 'Draft volunteer spotlight',
    description: 'Prepare a short member profile for the October newsletter and get approval from the featured volunteer.',
    owner: 'Maya Chen',
    dueDate: '2026-10-14',
    priority: 'Medium',
    status: 'To do',
    progress: 0,
  },
  {
    id: 'task-4',
    title: 'Update club welcome guide',
    description: 'Refresh the department contact details and add the current social media links to the welcome guide.',
    owner: 'Maya Chen',
    dueDate: '2026-10-16',
    priority: 'Low',
    status: 'In progress',
    progress: 45,
  },
  {
    id: 'task-5',
    title: 'Schedule October announcement',
    description: 'Queue the approved monthly announcement for the member newsletter and campus noticeboard.',
    owner: 'Maya Chen',
    dueDate: '2026-10-08',
    priority: 'Medium',
    status: 'To do',
    progress: 0,
  },
  {
    id: 'task-6',
    title: 'Collect event partner logos',
    description: 'Gather approved logo files from the event partners for the promotional materials.',
    owner: 'Maya Chen',
    dueDate: '2026-10-20',
    priority: 'Low',
    status: 'Completed',
    progress: 100,
  },
  {
    id: 'task-7',
    title: 'Prepare newsletter content plan',
    description: 'Outline the stories and key dates for the next student organization newsletter.',
    owner: 'Maya Chen',
    dueDate: '2026-10-22',
    priority: 'Medium',
    status: 'In progress',
    progress: 35,
  },
  {
    id: 'task-8',
    title: 'Publish welcome week recap',
    description: 'Publish the final recap after the event photos and department review are complete.',
    owner: 'Maya Chen',
    dueDate: '2026-10-02',
    priority: 'Low',
    status: 'Completed',
    progress: 100,
  },
];

export const upcomingEvents = [
  {
    id: 'event-1',
    title: 'Campus Welcome Mixer',
    date: '2026-10-18',
    time: '6:30 PM',
    location: 'Student Union Atrium',
    status: 'Confirmed',
    responsibility: 'Campaign and event photography',
    description: 'An evening mixer for new and returning members, with club introductions and light refreshments.',
  },
  {
    id: 'event-2',
    title: 'Community Service Day',
    date: '2026-10-24',
    time: '9:00 AM',
    location: 'North Lawn',
    status: 'Planning',
    responsibility: 'Promotional materials',
    description: 'A campus-wide volunteer day organized with student and neighborhood partners.',
  },
  {
    id: 'event-3',
    title: 'Student Organizations Fair',
    date: '2026-11-02',
    time: '12:00 PM',
    location: 'Main Quad',
    status: 'Confirmed',
    responsibility: 'Booth signage and social posts',
    description: 'A showcase of student organizations with a staffed Skyline information booth.',
  },
];

export const announcements = [
  {
    id: 'announcement-1',
    title: 'Welcome Mixer registration is open',
    body: 'Join us for an evening to meet fellow members and learn what is happening this semester.',
    status: 'Published',
    channel: 'Member newsletter',
    updatedAt: '2026-10-08',
  },
  {
    id: 'announcement-2',
    title: 'Volunteer sign-ups: Community Service Day',
    body: 'Sign-ups are open for our October community service activities. Details and timings will follow.',
    status: 'In review',
    channel: 'Campus noticeboard',
    updatedAt: '2026-10-07',
  },
  {
    id: 'announcement-3',
    title: 'October member newsletter',
    body: 'A draft roundup of upcoming events, member highlights, and volunteer opportunities.',
    status: 'Draft',
    channel: 'Member newsletter',
    updatedAt: '2026-10-05',
  },
];

export const activityItems = [
  { id: 'activity-1', message: 'The Welcome Mixer campaign is awaiting your final review.', time: 'Today', type: 'task' },
  { id: 'activity-2', message: 'Community Service Day venue details were added.', time: 'Yesterday', type: 'event' },
  { id: 'activity-3', message: 'A new announcement draft is ready for review.', time: 'Oct 7', type: 'announcement' },
  { id: 'activity-4', message: 'Partner logos were collected for the event materials.', time: 'Oct 6', type: 'task' },
];

export const participationByMonth = [
  { month: 'May', attendees: 38 },
  { month: 'Jun', attendees: 52 },
  { month: 'Jul', attendees: 43 },
  { month: 'Aug', attendees: 68 },
  { month: 'Sep', attendees: 76 },
  { month: 'Oct', attendees: 61 },
];

export const teamMembers = [
  { id: 'member-1', name: 'Maya Chen', role: 'Department Head', assignments: 5 },
  { id: 'member-2', name: 'Jordan Rivera', role: 'Content Coordinator', assignments: 3 },
  { id: 'member-3', name: 'Ariana Patel', role: 'Design Volunteer', assignments: 2 },
  { id: 'member-4', name: 'Sam Okafor', role: 'Events Liaison', assignments: 2 },
];

export const campaigns = [
  { id: 'campaign-1', title: 'Welcome Mixer', channel: 'Social + newsletter', status: 'In progress', dueDate: '2026-10-15', reach: '120 interested' },
  { id: 'campaign-2', title: 'Community Service Day', channel: 'Campus noticeboard', status: 'Planning', dueDate: '2026-10-19', reach: '48 sign-ups' },
  { id: 'campaign-3', title: 'Organizations Fair', channel: 'Booth + social', status: 'Planning', dueDate: '2026-10-27', reach: 'Not published' },
];

export const preferences = {
  emailUpdates: true,
  taskReminders: true,
};

export default {
  departmentSummary,
  profile,
  tasks,
  upcomingEvents,
  announcements,
  activityItems,
  participationByMonth,
  teamMembers,
  campaigns,
  preferences,
};
