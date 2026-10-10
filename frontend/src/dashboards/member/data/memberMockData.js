/* ==========================================================================
   ISOLATED MEMBER MOCK DATA
   (Person 2: Replace this dataset with your REST/GraphQL user endpoints:
   - GET /api/me/profile
   - GET /api/me/tickets
   - GET /api/me/reimbursements
   - GET /api/me/tasks
   - GET /api/me/orders)
   ========================================================================== */

export const MEMBER_MOCK_DATA = {
  profile: {
    id: "user-8842",
    name: "Alex Johnson",
    email: "alex.johnson@campus.edu",
    membershipStatus: "Active Member",
    memberSince: "Sept 2025",
    expiresOn: "2027-05-30",
    digitalPassId: "SKY-8842-2026",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  myTickets: [
    {
      id: "tkt-01",
      eventTitle: "HackCampus 2026: 24-Hour Innovation Sprint",
      date: "2026-10-24",
      time: "09:00 AM",
      venue: "Innovation Center Hall A",
      ticketCode: "QR-HACK-8842",
      status: "Confirmed Pass",
    },
    {
      id: "tkt-02",
      eventTitle: "AI & Machine Learning Career Workshop",
      date: "2026-10-28",
      time: "04:00 PM",
      venue: "Science Complex Rm 402",
      ticketCode: "QR-AI-8842",
      status: "Confirmed Pass",
    },
  ],
  myReimbursementClaims: [
    {
      id: "my-rmb-01",
      title: "Workshop Snacks & Drinks",
      amount: "$42.50",
      submittedDate: "2026-10-05",
      status: "approved",
      notes: "Approved by Treasurer on Oct 7",
    },
    {
      id: "my-rmb-02",
      title: "Club Banner Printing",
      amount: "$35.00",
      submittedDate: "2026-10-08",
      status: "pending",
      notes: "Under review by Admin",
    },
  ],
  myVolunteerTasks: [
    { id: "my-tsk-1", title: "Setup Check-in Table for Hackathon", dueDate: "2026-10-24", isCompleted: false },
    { id: "my-tsk-2", title: "Submit Workshop Feedback Form", dueDate: "2026-10-29", isCompleted: true },
  ],
  merchandiseCatalog: [
    { id: "mch-1", name: "Skyline Club Hoodie (Midnight Edition)", price: "$35.00", inStock: true, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80" },
    { id: "mch-2", name: "Skyline Holographic Sticker Pack", price: "$5.00", inStock: true, image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=400&q=80" },
  ],
  myMerchOrders: [
    { id: "ord-901", item: "Skyline Club Hoodie", price: "$35.00", orderDate: "2026-10-02", status: "Shipped" },
  ],
};

export default MEMBER_MOCK_DATA;
