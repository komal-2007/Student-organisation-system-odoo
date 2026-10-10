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

  financeSummary: {
    totalIncome: "$24,500.00",
    totalExpenses: "$12,050.00",
    netBalance: "$12,450.00",
    monthlyGoal: "$15,000.00",
    monthlyGoalPercent: 83,
    recentTransactions: [
      { id: "tx-1", date: "2026-10-08", title: "HackCampus Sponsorship", type: "income", amount: "+$3,500.00", category: "Sponsorship" },
      { id: "tx-2", date: "2026-10-06", title: "Auditorium Sound System Rental", type: "expense", amount: "-$650.00", category: "Event Tech" },
      { id: "tx-3", date: "2026-10-04", title: "Merchandise T-Shirt Print Run", type: "expense", amount: "-$1,200.00", category: "Merchandise" },
      { id: "tx-4", date: "2026-10-01", title: "Membership Dues Collection", type: "income", amount: "+$1,420.00", category: "Dues" },
    ],
  },

  reimbursementQueue: [
    { id: "rmb-101", memberName: "Sarah Jenkins", title: "Catering for AI Workshop", amount: "$145.50", date: "2026-10-09", receiptUrl: "#", status: "pending" },
    { id: "rmb-102", memberName: "Alex Rivera", title: "Poster Printing & Banners", amount: "$82.00", date: "2026-10-07", receiptUrl: "#", status: "pending" },
    { id: "rmb-103", memberName: "David Chen", title: "Cloud Hosting & Domain", amount: "$24.99", date: "2026-10-02", receiptUrl: "#", status: "approved" },
  ],

  members: [
    { id: "mem-1", name: "Komal Bhatia", role: "President / Admin", email: "komal@campus.edu", department: "Executive", status: "Active", joinedDate: "Sep 2024" },
    { id: "mem-2", name: "Sarah Jenkins", role: "Vice President", email: "sarah@campus.edu", department: "Operations", status: "Active", joinedDate: "Jan 2025" },
    { id: "mem-3", name: "Alex Rivera", role: "Treasurer", email: "alex@campus.edu", department: "Finance", status: "Active", joinedDate: "Sep 2025" },
    { id: "mem-4", name: "David Chen", role: "Member", email: "david@campus.edu", department: "Tech", status: "Pending Approval", joinedDate: "Oct 2026" },
    { id: "mem-5", name: "Elena Rostova", role: "Marketing Lead", email: "elena@campus.edu", department: "Marketing", status: "Active", joinedDate: "Feb 2025" },
  ],

  volunteerTasks: [
    { id: "tsk-1", title: "Setup Welcome Desk at Hall A", department: "Logistics", assignee: "Sarah Jenkins", status: "In Progress", dueDate: "2026-10-24" },
    { id: "tsk-2", title: "Design Social Media Graphics", department: "Marketing", assignee: "Elena Rostova", status: "Completed", dueDate: "2026-10-20" },
    { id: "tsk-3", title: "Order Pizza & Refreshments", department: "Catering", assignee: "David Chen", status: "Pending", dueDate: "2026-10-23" },
    { id: "tsk-4", title: "Manage Registration QR Scanner", department: "Tech", assignee: "Alex Rivera", status: "In Progress", dueDate: "2026-10-24" },
  ],

  fundraisingCampaigns: [
    { id: "fnd-1", title: "Annual Robot Build Fund", target: "$5,000", raised: "$3,450", percentage: 69, status: "Active" },
    { id: "fnd-2", title: "Diversity in Tech Scholarship", target: "$2,500", raised: "$2,500", percentage: 100, status: "Completed" },
    { id: "fnd-3", title: "Hackathon Travel Grant", target: "$3,000", raised: "$1,800", percentage: 60, status: "Active" },
  ],

  announcements: [
    { id: "ann-1", title: "General Body Meeting Scheduled for Thursday", date: "Oct 10, 2026", category: "Meeting", author: "Komal Bhatia", priority: "High" },
    { id: "ann-2", title: "Reimbursement Deadline for October Events", date: "Oct 08, 2026", category: "Finance", author: "Alex Rivera", priority: "Medium" },
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
