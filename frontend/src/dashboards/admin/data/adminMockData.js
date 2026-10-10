/* ==========================================================================
   ISOLATED ADMIN MOCK DATA
   (Person 2: Replace this file's data with your REST/GraphQL API endpoints:
   - GET /api/admin/overview
   - GET /api/admin/finance
   - GET /api/admin/reimbursements
   - GET /api/admin/members
   - GET /api/admin/volunteers
   - GET /api/admin/fundraising)
   ========================================================================== */

export const ADMIN_MOCK_DATA = {
  stats: {
    totalMembers: 142,
    activeEvents: 8,
    treasuryBalance: "$12,450.00",
    pendingApprovals: 5,
  },
  financeSummary: {
    totalIncome: "$24,500.00",
    totalExpenses: "$12,050.00",
    netBalance: "$12,450.00",
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
    { id: "mem-1", name: "Komal Bhatia", role: "President / Admin", email: "komal@campus.edu", department: "Executive", status: "Active" },
    { id: "mem-2", name: "Sarah Jenkins", role: "Vice President", email: "sarah@campus.edu", department: "Operations", status: "Active" },
    { id: "mem-3", name: "Alex Rivera", role: "Treasurer", email: "alex@campus.edu", department: "Finance", status: "Active" },
    { id: "mem-4", name: "David Chen", role: "Member", email: "david@campus.edu", department: "Tech", status: "Pending Approval" },
  ],
  volunteerTasks: [
    { id: "tsk-1", title: "Setup Welcome Desk at Hall A", department: "Logistics", assignee: "Sarah Jenkins", status: "In Progress", dueDate: "2026-10-24" },
    { id: "tsk-2", title: "Design Social Media Graphics", department: "Marketing", assignee: "Alex Rivera", status: "Completed", dueDate: "2026-10-20" },
    { id: "tsk-3", title: "Order Pizza & Refreshments", department: "Catering", assignee: "David Chen", status: "Pending", dueDate: "2026-10-23" },
  ],
  fundraisingCampaigns: [
    { id: "fnd-1", title: "Annual Robot Build Fund", target: "$5,000", raised: "$3,450", percentage: 69, status: "Active" },
    { id: "fnd-2", title: "Diversity in Tech Scholarship", target: "$2,500", raised: "$2,500", percentage: 100, status: "Completed" },
  ],
};

export default ADMIN_MOCK_DATA;
