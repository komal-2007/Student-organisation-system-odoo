/* ==========================================================================
   ISOLATED ADMIN MOCK DATA (Skyline System)
   (Person 2: Replace this dataset with API endpoints:
   - GET /api/admin/stats
   - GET /api/admin/overview
   - GET /api/admin/events
   - GET /api/admin/members
   - GET /api/admin/finance
   - GET /api/admin/reimbursements
   - GET /api/admin/announcements
   - GET /api/admin/fundraising
   - GET /api/admin/volunteers
   - GET /api/admin/merchandise)
   ========================================================================== */

export const ADMIN_MOCK_DATA = {
  stats: {
    totalMembers: 142,
    activeEvents: 8,
    treasuryBalance: "$12,450.00",
    pendingApprovals: 5,
    fundraisingTotal: "$8,950.00",
    volunteersActive: 34,
  },
  
  pendingActions: [
    { id: "pa-1", type: "reimbursement", title: "Sarah Jenkins — Catering for AI Workshop ($145.50)", urgency: "high", date: "2 hours ago" },
    { id: "pa-2", type: "membership", title: "David Chen — Requested to join Tech Department", urgency: "medium", date: "4 hours ago" },
    { id: "pa-3", type: "event", title: "HackCampus 2026 reached 87% capacity (Review cap)", urgency: "low", date: "6 hours ago" },
    { id: "pa-4", type: "reimbursement", title: "Alex Rivera — Poster Printing & Banners ($82.00)", urgency: "medium", date: "1 day ago" },
  ],

  overviewEvents: [
    { id: "evt-1", title: "HackCampus 2026: 24-Hour Innovation Sprint", date: "Oct 24, 2026", registered: 218, capacity: 250, status: "upcoming", category: "Hackathon" },
    { id: "evt-2", title: "AI & Machine Learning Career Workshop", date: "Oct 28, 2026", registered: 76, capacity: 80, status: "upcoming", category: "Workshop" },
    { id: "evt-3", title: "Fall Semester Campus Mixer & Club Fair", date: "Nov 02, 2026", registered: 340, capacity: 500, status: "upcoming", category: "Social" },
  ],

  /* ── Full Events List (AdminEvents screen) — MOCK ── */
  events: [
    {
      id: "evt-101", title: "HackCampus 2026: 24-Hour Innovation Sprint",
      date: "2026-10-24", time: "09:00 AM", venue: "Engineering Hall B",
      category: "Hackathon", capacity: 250, registered: 218,
      status: "upcoming", description: "Annual 24-hour hackathon open to all departments.",
      organizer: "Komal Bhatia", ticketPrice: "Free",
    },
    {
      id: "evt-102", title: "AI & Machine Learning Career Workshop",
      date: "2026-10-28", time: "02:00 PM", venue: "Lecture Theatre 4",
      category: "Workshop", capacity: 80, registered: 76,
      status: "upcoming", description: "Industry speakers from Google and DeepMind.",
      organizer: "Sarah Jenkins", ticketPrice: "$5.00",
    },
    {
      id: "evt-103", title: "Fall Semester Campus Mixer & Club Fair",
      date: "2026-11-02", time: "05:00 PM", venue: "Campus Quad",
      category: "Social", capacity: 500, registered: 340,
      status: "upcoming", description: "Open campus mixer featuring all student clubs.",
      organizer: "Elena Rostova", ticketPrice: "Free",
    },
    {
      id: "evt-104", title: "Robotics Build Day — Open Workshop",
      date: "2026-11-10", time: "10:00 AM", venue: "Maker Lab 2",
      category: "Workshop", capacity: 40, registered: 12,
      status: "draft", description: "Hands-on robot build session. Draft pending final venue confirmation.",
      organizer: "Alex Rivera", ticketPrice: "Free",
    },
    {
      id: "evt-105", title: "Skyline Annual Awards Night",
      date: "2026-09-15", time: "07:00 PM", venue: "Rooftop Lounge",
      category: "Ceremony", capacity: 120, registered: 120,
      status: "past", description: "End-of-year awards recognizing top contributors.",
      organizer: "Komal Bhatia", ticketPrice: "$10.00",
    },
    {
      id: "evt-106", title: "Web Development Bootcamp — Day 1",
      date: "2026-09-20", time: "10:00 AM", venue: "CS Lab 301",
      category: "Workshop", capacity: 60, registered: 55,
      status: "past", description: "3-day bootcamp covering React and Node.js basics.",
      organizer: "David Chen", ticketPrice: "Free",
    },
  ],

  /* ── Attendees per event — MOCK ── */
  eventAttendees: {
    "evt-101": [
      { id: "a1", name: "Sarah Jenkins", email: "sarah@campus.edu", department: "Operations", registeredOn: "2026-10-01", status: "confirmed" },
      { id: "a2", name: "David Chen", email: "david@campus.edu", department: "Tech", registeredOn: "2026-10-03", status: "confirmed" },
      { id: "a3", name: "Elena Rostova", email: "elena@campus.edu", department: "Marketing", registeredOn: "2026-10-05", status: "confirmed" },
    ],
    "evt-102": [
      { id: "b1", name: "Alex Rivera", email: "alex@campus.edu", department: "Finance", registeredOn: "2026-10-06", status: "confirmed" },
      { id: "b2", name: "Priya Nair", email: "priya@campus.edu", department: "Tech", registeredOn: "2026-10-07", status: "waitlisted" },
    ],
  },

  financeSummary: {
    totalIncome: "$24,500.00",
    totalExpenses: "$12,050.00",
    netBalance: "$12,450.00",
    monthlyGoal: "$15,000.00",
    monthlyGoalPercent: 83,
    recentTransactions: [
      { id: "tx-1", date: "2026-10-08", title: "HackCampus Sponsorship (TechCorp)", type: "income", amount: "+$3,500.00", category: "Sponsorship", ref: "TRX-9901", method: "Bank Wire", notes: "Gold tier corporate event sponsorship." },
      { id: "tx-2", date: "2026-10-06", title: "Auditorium Sound System Rental", type: "expense", amount: "-$650.00", category: "Event Tech", ref: "TRX-9884", method: "Corporate Card", notes: "A/V equipment for Fall General Assembly." },
      { id: "tx-3", date: "2026-10-04", title: "Merchandise T-Shirt Print Run", type: "expense", amount: "-$1,200.00", category: "Merchandise", ref: "TRX-9850", method: "Corporate Card", notes: "200 custom hoodies & shirts for club store." },
      { id: "tx-4", date: "2026-10-01", title: "Membership Dues Collection", type: "income", amount: "+$1,420.00", category: "Dues", ref: "TRX-9812", method: "Stripe Online", notes: "Fall Semester member registration fees." },
      { id: "tx-5", date: "2026-09-28", title: "Robotics Workshop Components", type: "expense", amount: "-$340.00", category: "Equipment", ref: "TRX-9799", method: "Reimbursement Payout", notes: "Microcontrollers and sensors for Maker Lab." },
      { id: "tx-6", date: "2026-09-20", title: "Alumni Donation Grant", type: "income", amount: "+$2,000.00", category: "Donation", ref: "TRX-9750", method: "Check Deposit", notes: "Unrestricted grant from Alumni Association." },
    ],
  },

  reimbursementQueue: [
    { id: "rmb-101", memberName: "Sarah Jenkins", title: "Catering for AI Workshop", amount: "$145.50", category: "Event Catering", date: "2026-10-09", receiptUrl: "#", status: "pending", department: "Operations", notes: "Sandwiches and drinks for 40 participants from Campus Dining." },
    { id: "rmb-102", memberName: "Alex Rivera", title: "Poster Printing & Banners", amount: "$82.00", category: "Marketing", date: "2026-10-07", receiptUrl: "#", status: "pending", department: "Finance", notes: "Large vinyl banner for Fall Mixer booth." },
    { id: "rmb-103", memberName: "David Chen", title: "Cloud Hosting & Domain", amount: "$24.99", category: "Infrastructure", date: "2026-10-02", receiptUrl: "#", status: "approved", department: "Tech", notes: "AWS EC2 monthly instance charge for club server." },
    { id: "rmb-104", memberName: "Elena Rostova", title: "Social Media Ad Campaign", amount: "$50.00", category: "Marketing", date: "2026-09-28", receiptUrl: "#", status: "approved", department: "Marketing", notes: "Instagram promo boost for HackCampus 2026." },
    { id: "rmb-105", memberName: "Marcus Vance", title: "Unapproved Taxi Fare", amount: "$65.00", category: "Travel", date: "2026-09-25", receiptUrl: "#", status: "rejected", department: "Logistics", notes: "Late night taxi fare without prior executive authorization." },
  ],

  members: [
    { id: "mem-1", name: "Komal Bhatia", role: "President / Admin", email: "komal@campus.edu", phone: "+1 (555) 019-2831", department: "Executive", status: "Active", joinedDate: "Sep 2024", studentId: "SKY-2024-001" },
    { id: "mem-2", name: "Sarah Jenkins", role: "Vice President", email: "sarah@campus.edu", phone: "+1 (555) 014-9920", department: "Operations", status: "Active", joinedDate: "Jan 2025", studentId: "SKY-2025-042" },
    { id: "mem-3", name: "Alex Rivera", role: "Treasurer", email: "alex@campus.edu", phone: "+1 (555) 018-3341", department: "Finance", status: "Active", joinedDate: "Sep 2025", studentId: "SKY-2025-108" },
    { id: "mem-4", name: "David Chen", role: "Member", email: "david@campus.edu", phone: "+1 (555) 012-7711", department: "Tech", status: "Pending Approval", joinedDate: "Oct 2026", studentId: "SKY-2026-210", notes: "Applied for Tech Lead role" },
    { id: "mem-5", name: "Elena Rostova", role: "Marketing Lead", email: "elena@campus.edu", phone: "+1 (555) 016-5582", department: "Marketing", status: "Active", joinedDate: "Feb 2025", studentId: "SKY-2025-088" },
    { id: "mem-6", name: "Marcus Vance", role: "Member", email: "marcus@campus.edu", phone: "+1 (555) 013-4410", department: "Logistics", status: "Pending Approval", joinedDate: "Oct 2026", studentId: "SKY-2026-215", notes: "Transferred from CS Society" },
    { id: "mem-7", name: "Priya Nair", role: "Member", email: "priya@campus.edu", phone: "+1 (555) 011-8833", department: "Tech", status: "Active", joinedDate: "Mar 2026", studentId: "SKY-2026-150" },
    { id: "mem-8", name: "Liam O'Connor", role: "Member", email: "liam@campus.edu", phone: "+1 (555) 017-6629", department: "Events", status: "Inactive", joinedDate: "Nov 2024", studentId: "SKY-2024-033" },
  ],

  volunteerTasks: [
    { id: "tsk-1", title: "Setup Welcome Desk & QR Scanner at Hall A", department: "Logistics", assignee: "Sarah Jenkins", status: "In Progress", priority: "High", dueDate: "2026-10-24", notes: "Ensure 2 tablets and QR code printed signs are ready by 8:30 AM." },
    { id: "tsk-2", title: "Design Social Media Promo Banners", department: "Marketing", assignee: "Elena Rostova", status: "Completed", priority: "Medium", dueDate: "2026-10-20", notes: "Exported in 1080x1080 and 1080x1920 formats for Instagram." },
    { id: "tsk-3", title: "Order Catering & Refreshment Drinks", department: "Catering", assignee: "David Chen", status: "Pending", priority: "High", dueDate: "2026-10-23", notes: "Order vegan options for 15% of attendees." },
    { id: "tsk-4", title: "Manage Tech Registration Desk & Badges", department: "Tech", assignee: "Alex Rivera", status: "In Progress", priority: "High", dueDate: "2026-10-24", notes: "Coordinate with campus IT for guest Wi-Fi passes." },
    { id: "tsk-5", title: "Photographer & Video Highlights Reel", department: "Marketing", assignee: "Marcus Vance", status: "Pending", priority: "Low", dueDate: "2026-10-25", notes: "Capture keynotes and project demo presentations." },
  ],

  fundraisingCampaigns: [
    { id: "fnd-1", title: "Annual Robot Build & Hardware Fund", target: "$5,000", raised: "$3,450", rawTarget: 5000, rawRaised: 3450, percentage: 69, status: "Active", category: "Hardware", endDate: "2026-11-30", description: "Funding microcontrollers, motors, and 3D printing filament for our Maker Lab teams.", donorsCount: 28 },
    { id: "fnd-2", title: "Diversity in Tech Student Scholarship", target: "$2,500", raised: "$2,500", rawTarget: 2500, rawRaised: 2500, percentage: 100, status: "Completed", category: "Scholarship", endDate: "2026-10-01", description: "Grant providing travel and registration support for underrepresented students.", donorsCount: 42 },
    { id: "fnd-3", title: "National Hackathon Travel Grant", target: "$3,000", raised: "$1,800", rawTarget: 3000, rawRaised: 1800, percentage: 60, status: "Active", category: "Travel", endDate: "2026-12-15", description: "Covering bus transportation and lodging for teams competing in national hackathons.", donorsCount: 19 },
  ],

  announcements: [
    { id: "ann-1", title: "General Body Meeting Scheduled for Thursday", body: "Join us this Thursday at 6:00 PM in Hall A for our monthly all-hands update. Agenda items include Fall hackathon logistics, budget allocations, and new member introductions.", date: "2026-10-10", category: "Meeting", author: "Komal Bhatia", priority: "High", audience: "All Members", status: "Published", pinned: true },
    { id: "ann-2", title: "Reimbursement Deadline for October Events", body: "Please submit all expense claims for September & early October events by Friday midnight. Late receipts will not be processed until the next financial cycle.", date: "2026-10-08", category: "Finance", author: "Alex Rivera", priority: "Medium", audience: "All Members", status: "Published", pinned: false },
    { id: "ann-3", title: "Tech Team Core Workshop: AI Pipeline Setup", body: "Hands-on session for Tech Department members building the new portal services. Bring your laptop with Node v20 installed.", date: "2026-10-05", category: "Technical", author: "David Chen", priority: "Low", audience: "Tech Department", status: "Published", pinned: false },
    { id: "ann-4", title: "Draft: Executive Board Election Guidelines 2027", body: "Internal draft outlining nomination procedures and voting criteria for the upcoming spring elections.", date: "2026-10-02", category: "Governance", author: "Sarah Jenkins", priority: "High", audience: "Executive Board", status: "Draft", pinned: false },
  ],

  merchandiseInventory: [
    { id: "inv-1", name: "Skyline Midnight Hoodie", category: "Apparel", stock: 45, price: "$35.00", status: "In Stock" },
    { id: "inv-2", name: "Holographic Constellation Sticker", category: "Accessories", stock: 180, price: "$5.00", status: "In Stock" },
    { id: "inv-3", name: "Skyline Insulated Water Bottle", category: "Merchandise", stock: 8, price: "$18.00", status: "Low Stock" },
  ],

  recentActivity: [
    { id: "act-1", user: "Komal Bhatia", action: "Published announcement 'General Body Meeting Scheduled'", time: "10 mins ago" },
    { id: "act-2", user: "Alex Rivera", action: "Approved reimbursement #rmb-103 for Cloud Hosting", time: "2 hours ago" },
    { id: "act-3", user: "Sarah Jenkins", action: "Updated capacity for HackCampus 2026 to 250", time: "5 hours ago" },
  ],
};

export default ADMIN_MOCK_DATA;
