/* ==========================================================================
   ISOLATED MEMBER MOCK DATA (Skyline System)
   Strictly scoped to the authenticated student member (GET /api/me/*).
   Contains ZERO administrative ledgers, club-wide finances, or approval controls.
   ========================================================================== */

export const MEMBER_MOCK_DATA = {
  profile: {
    id: "user-8842",
    name: "Alex Johnson",
    email: "alex.johnson@campus.edu",
    role: "Registered Member",
    membershipTier: "Full Member",
    membershipStatus: "Active",
    memberSince: "Sept 2025",
    expiresOn: "May 30, 2027",
    digitalPassId: "SKY-8842-2026",
    department: "Tech & Innovation",
    avatarInitials: "AJ",
  },

  stats: {
    activePasses: 2,
    membershipStatus: "Active",
    pendingClaims: 1,
    assignedTasks: 2,
  },

  myTickets: [
    {
      id: "tkt-01",
      eventTitle: "HackCampus 2026: 24-Hour Innovation Sprint",
      category: "Hackathon",
      date: "Oct 24, 2026",
      time: "09:00 AM – 09:00 AM",
      venue: "Innovation Center Hall A",
      ticketCode: "SKY-PASS-HACK-8842",
      ticketType: "Participant Pass (Full Access)",
      status: "Confirmed",
    },
    {
      id: "tkt-02",
      eventTitle: "AI & Machine Learning Career Workshop",
      category: "Workshop",
      date: "Oct 28, 2026",
      time: "04:00 PM – 06:30 PM",
      venue: "Science Complex Rm 402",
      ticketCode: "SKY-PASS-AI-8842",
      ticketType: "Standard Workshop Seat",
      status: "Confirmed",
    },
  ],

  discoverEvents: [
    {
      id: "evt-01",
      title: "Fall Semester Campus Mixer & Club Fair",
      category: "Social",
      date: "Nov 02, 2026",
      time: "05:00 PM – 08:00 PM",
      venue: "Student Union Plaza",
      capacity: 500,
      registered: 340,
      description: "Meet fellow club members, department heads, and project teams over food and refreshments.",
      isRegistered: false,
    },
    {
      id: "evt-02",
      title: "Full-Stack Web Dev Hack Night",
      category: "Tech",
      date: "Nov 12, 2026",
      time: "06:00 PM – 09:30 PM",
      venue: "Tech Hub Lab 3",
      capacity: 60,
      registered: 48,
      description: "Collaborative coding session building open-source community microservices.",
      isRegistered: false,
    },
    {
      id: "evt-03",
      title: "Annual Student Leadership Summit",
      category: "Leadership",
      date: "Nov 20, 2026",
      time: "10:00 AM – 03:00 PM",
      venue: "Auditorium Main Stage",
      capacity: 200,
      registered: 185,
      description: "Keynotes from campus organization leads, alumni founders, and project directors.",
      isRegistered: false,
    },
  ],

  myReimbursementClaims: [
    {
      id: "my-rmb-01",
      title: "Workshop Snacks & Refreshments",
      category: "Food & Beverage",
      amount: "$42.50",
      submittedDate: "Oct 05, 2026",
      status: "approved",
      notes: "Receipt verified by Treasurer. Disbursement scheduled.",
    },
    {
      id: "my-rmb-02",
      title: "Club Banner & Poster Printing",
      category: "Marketing",
      amount: "$35.00",
      submittedDate: "Oct 08, 2026",
      status: "pending",
      notes: "Under review by Admin / Treasurer.",
    },
  ],

  myVolunteerTasks: [
    {
      id: "my-tsk-1",
      title: "Setup Check-in Table for Hackathon",
      department: "Logistics",
      dueDate: "Oct 24, 2026",
      priority: "High",
      isCompleted: false,
      notes: "Arrive at Hall A by 08:15 AM to distribute badges and swag bags.",
    },
    {
      id: "my-tsk-2",
      title: "Manage Discord Q&A Channel during Tech Night",
      department: "Community",
      dueDate: "Nov 12, 2026",
      priority: "Medium",
      isCompleted: false,
      notes: "Monitor #hack-help channel and assist beginners with setup.",
    },
    {
      id: "my-tsk-3",
      title: "Submit Workshop Feedback Form",
      department: "General",
      dueDate: "Oct 10, 2026",
      priority: "Low",
      isCompleted: true,
      notes: "Submitted responses to Executive team.",
    },
  ],

  merchandiseCatalog: [
    {
      id: "mch-1",
      name: "Skyline Midnight Hoodie",
      category: "Apparel",
      price: "$35.00",
      inStock: true,
      description: "Heavyweight organic cotton hoodie with embroidered constellation logo.",
    },
    {
      id: "mch-2",
      name: "Holographic Constellation Sticker Pack",
      category: "Accessories",
      price: "$5.00",
      inStock: true,
      description: "Set of 5 weather-resistant vinyl stickers for laptops and bottles.",
    },
    {
      id: "mch-3",
      name: "Skyline Insulated Stainless Bottle",
      category: "Drinkware",
      price: "$18.00",
      inStock: true,
      description: "500ml vacuum-insulated bottle with laser-engraved Skyline crest.",
    },
  ],

  myMerchOrders: [
    {
      id: "ord-901",
      item: "Skyline Midnight Hoodie",
      price: "$35.00",
      orderDate: "Oct 02, 2026",
      status: "Fulfilled",
      pickupLocation: "Club Room 204",
    },
  ],

  announcements: [
    {
      id: "ann-1",
      title: "General Body Meeting Scheduled for Thursday",
      category: "Meeting",
      date: "Oct 10, 2026",
      author: "Komal Bhatia (President)",
      priority: "High",
      content: "Join us this Thursday at 6:00 PM in Hall B for updates on upcoming semester hackathons, merchandise distribution, and department initiatives.",
    },
    {
      id: "ann-2",
      title: "HackCampus 2026 Participant Registration Extended",
      category: "Event Alert",
      date: "Oct 09, 2026",
      author: "Sarah Jenkins (VP Operations)",
      priority: "Medium",
      content: "Due to high demand, registration cap has been expanded to 250 participants. Claim your pass before slots close.",
    },
    {
      id: "ann-3",
      title: "Reimbursement Deadline for October Events",
      category: "Finance",
      date: "Oct 08, 2026",
      author: "Alex Rivera (Treasurer)",
      priority: "Medium",
      content: "Please ensure all expense receipts for early October events are submitted through your My Claims portal by Oct 15.",
    },
  ],

  personalActivity: [
    {
      id: "act-1",
      action: "Claimed participant pass for HackCampus 2026",
      date: "2 days ago",
    },
    {
      id: "act-2",
      action: "Submitted reimbursement claim for Club Banner Printing ($35.00)",
      date: "Oct 08, 2026",
    },
    {
      id: "act-3",
      action: "Completed volunteer task 'Submit Workshop Feedback Form'",
      date: "Oct 06, 2026",
    },
  ],
};

export default MEMBER_MOCK_DATA;
