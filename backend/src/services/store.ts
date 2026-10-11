import fs from 'node:fs';
import path from 'node:path';

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'core_member';
  department?: string;
  title?: string;
  membershipTier?: string;
  studentId?: string;
  status: string;
  joinedDate?: string;
  phone?: string;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue?: string;
  category?: string;
  capacity: number;
  registered: number;
  status: string; // upcoming, draft, past
  description?: string;
  organizer?: string;
  ticketPrice: string;
  rawPrice: number;
}

export interface TicketRecord {
  id: string;
  ticketNumber: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  qrToken: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  paymentRef?: string;
  paidAmount: number;
  checkedInAt?: string;
  createdAt: string;
}

export interface MerchItemRecord {
  id: string;
  name: string;
  price: string;
  rawPrice: number;
  category: string;
  inStock: boolean;
  stockCount: number;
  description?: string;
  pickupLocation?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentRef?: string;
  pickupLocation: string;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: string;
  rawAmount: number;
  category: string;
  method?: string;
  ref?: string;
  notes?: string;
  date: string;
}

export interface ReimbursementRecord {
  id: string;
  claimNumber: string;
  userId: string;
  userName: string;
  title: string;
  amount: string;
  rawAmount: number;
  category: string;
  date: string;
  status: 'Pending Approval' | 'Approved' | 'Paid' | 'Rejected';
  notes?: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  category?: string;
  author?: string;
  priority?: string;
  audience?: string;
  pinned: boolean;
  date: string;
}

export interface VolunteerTaskRecord {
  id: string;
  title: string;
  department: string;
  assignee?: string;
  status: string; // Pending, In Progress, Review, Completed
  priority: string;
  dueDate: string;
  notes?: string;
  progress: number;
}

export interface FundraisingCampaignRecord {
  id: string;
  title: string;
  target: string;
  raised: string;
  rawTarget: number;
  rawRaised: number;
  percentage: number;
  status: string;
  category?: string;
  endDate?: string;
  description?: string;
  donorsCount: number;
}

interface DatabaseSchema {
  users: UserRecord[];
  events: EventRecord[];
  tickets: TicketRecord[];
  merchandise: MerchItemRecord[];
  orders: OrderRecord[];
  transactions: TransactionRecord[];
  reimbursements: ReimbursementRecord[];
  announcements: AnnouncementRecord[];
  volunteerTasks: VolunteerTaskRecord[];
  fundraisingCampaigns: FundraisingCampaignRecord[];
}

const DB_PATH = path.resolve(__dirname, '../../data/db.json');

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'demo-admin',
      username: 'admin1',
      password: 'admin123',
      name: 'Komal Bhatia',
      email: 'komal@skyline.edu',
      role: 'admin',
      department: 'Executive',
      title: 'Club President',
      status: 'Active',
      joinedDate: 'Sep 2024',
      studentId: 'SKY-2024-001',
    },
    {
      id: 'demo-member',
      username: 'mem1',
      password: 'mem123',
      name: 'Alex Johnson',
      email: 'alex.j@skyline.edu',
      role: 'member',
      membershipTier: 'Premium',
      studentId: 'ST-92841',
      status: 'Active',
      joinedDate: 'Jan 2025',
    },
    {
      id: 'demo-core-member',
      username: 'core_mem',
      password: 'Core123',
      name: 'Morgan Chen',
      email: 'morgan@skyline.edu',
      role: 'core_member',
      department: 'Marketing',
      title: 'Marketing Lead',
      status: 'Active',
      joinedDate: 'Feb 2025',
    },
    {
      id: 'mem-2',
      username: 'sarah_j',
      password: 'user123',
      name: 'Sarah Jenkins',
      email: 'sarah@campus.edu',
      role: 'admin',
      department: 'Operations',
      title: 'Vice President',
      status: 'Active',
      joinedDate: 'Jan 2025',
      studentId: 'SKY-2025-042',
    },
    {
      id: 'mem-3',
      username: 'alex_r',
      password: 'user123',
      name: 'Alex Rivera',
      email: 'alex@campus.edu',
      role: 'core_member',
      department: 'Finance',
      title: 'Treasurer',
      status: 'Active',
      joinedDate: 'Sep 2025',
      studentId: 'SKY-2025-108',
    },
    {
      id: 'mem-4',
      username: 'david_c',
      password: 'user123',
      name: 'David Chen',
      email: 'david@campus.edu',
      role: 'member',
      department: 'Tech',
      status: 'Pending Approval',
      joinedDate: 'Oct 2026',
      studentId: 'SKY-2026-210',
    },
    {
      id: 'mem-5',
      username: 'elena_r',
      password: 'user123',
      name: 'Elena Rostova',
      email: 'elena@campus.edu',
      role: 'core_member',
      department: 'Marketing',
      title: 'Marketing Lead',
      status: 'Active',
      joinedDate: 'Feb 2025',
      studentId: 'SKY-2025-088',
    },
    {
      id: 'mem-6',
      username: 'marcus_v',
      password: 'user123',
      name: 'Marcus Vance',
      email: 'marcus@campus.edu',
      role: 'member',
      department: 'Logistics',
      status: 'Pending Approval',
      joinedDate: 'Oct 2026',
      studentId: 'SKY-2026-215',
    },
  ],
  events: [
    {
      id: 'evt-101',
      title: 'HackCampus 2026: 24-Hour Innovation Sprint',
      date: '2026-10-24',
      time: '09:00 AM',
      venue: 'Engineering Hall B',
      category: 'Hackathon',
      capacity: 250,
      registered: 218,
      status: 'upcoming',
      description: 'Annual 24-hour hackathon open to all departments.',
      organizer: 'Komal Bhatia',
      ticketPrice: 'Free',
      rawPrice: 0,
    },
    {
      id: 'evt-102',
      title: 'AI & Machine Learning Career Workshop',
      date: '2026-10-28',
      time: '02:00 PM',
      venue: 'Lecture Theatre 4',
      category: 'Workshop',
      capacity: 80,
      registered: 76,
      status: 'upcoming',
      description: 'Industry speakers from Google and DeepMind.',
      organizer: 'Sarah Jenkins',
      ticketPrice: '$5.00',
      rawPrice: 5.0,
    },
    {
      id: 'evt-103',
      title: 'Fall Semester Campus Mixer & Club Fair',
      date: '2026-11-02',
      time: '05:00 PM',
      venue: 'Campus Quad',
      category: 'Social',
      capacity: 500,
      registered: 340,
      status: 'upcoming',
      description: 'Open campus mixer featuring all student clubs.',
      organizer: 'Elena Rostova',
      ticketPrice: 'Free',
      rawPrice: 0,
    },
    {
      id: 'evt-104',
      title: 'Robotics Build Day — Open Workshop',
      date: '2026-11-10',
      time: '10:00 AM',
      venue: 'Maker Lab 2',
      category: 'Workshop',
      capacity: 40,
      registered: 12,
      status: 'draft',
      description: 'Hands-on robot build session. Draft pending final venue confirmation.',
      organizer: 'Alex Rivera',
      ticketPrice: 'Free',
      rawPrice: 0,
    },
  ],
  tickets: [],
  merchandise: [
    {
      id: 'prod-1',
      name: 'Skyline Official Oversized Hoodie',
      price: '$45.00',
      rawPrice: 45.0,
      category: 'Apparel',
      inStock: true,
      stockCount: 50,
      description: 'Heavyweight 400gsm organic cotton hoodie with embroidered Skyline chest logo.',
      pickupLocation: 'Campus Center Room 204',
    },
    {
      id: 'prod-2',
      name: 'Skyline Metal Tech Water Bottle (750ml)',
      price: '$22.00',
      rawPrice: 22.0,
      category: 'Accessories',
      inStock: true,
      stockCount: 85,
      description: 'Double-wall vacuum insulated stainless steel water bottle. Keeps cold for 24 hours.',
      pickupLocation: 'Campus Center Room 204',
    },
    {
      id: 'prod-3',
      name: 'Skyline Developer Sticker Pack (6 Pcs)',
      price: '$8.00',
      rawPrice: 8.0,
      category: 'Accessories',
      inStock: true,
      stockCount: 150,
      description: 'Durable vinyl matte finish stickers suitable for laptops, notebooks, and water bottles.',
      pickupLocation: 'Campus Center Room 204',
    },
  ],
  orders: [
    {
      id: 'ord-501',
      orderNumber: 'ORD-98201',
      userId: 'demo-member',
      userName: 'Alex Johnson',
      itemId: 'prod-1',
      itemName: 'Skyline Official Oversized Hoodie',
      quantity: 1,
      totalPrice: 45.0,
      status: 'CONFIRMED',
      paymentRef: 'PAY-SANDBOX-98201',
      pickupLocation: 'Campus Center Room 204',
      createdAt: '2026-10-05T14:30:00.000Z',
    },
  ],
  transactions: [
    {
      id: 'tx-1',
      date: '2026-10-08',
      title: 'Sponsorship Grant — TechCorp Global',
      type: 'income',
      amount: '+$3,500.00',
      rawAmount: 3500.0,
      category: 'Sponsorship',
      method: 'Bank Wire',
      ref: 'TRX-9081',
      notes: 'Tier 1 Platinum Event Sponsorship for HackCampus 2026',
    },
    {
      id: 'tx-2',
      date: '2026-10-06',
      title: 'Hall B Audio/Visual Equipment Rental',
      type: 'expense',
      amount: '-$420.00',
      rawAmount: 420.0,
      category: 'Equipment',
      method: 'Corporate Card',
      ref: 'TRX-9082',
      notes: '3 microphones, projector, and dual speakers for career workshop',
    },
    {
      id: 'tx-3',
      date: '2026-10-04',
      title: 'Merchandise Store T-Shirt Bulk Order',
      type: 'expense',
      amount: '-$850.00',
      rawAmount: 850.0,
      category: 'Merchandise',
      method: 'Bank Wire',
      ref: 'TRX-9083',
      notes: '200 printed cotton navy t-shirts for Fall semester inventory',
    },
  ],
  reimbursements: [
    {
      id: 'rmb-1',
      claimNumber: 'CLM-104',
      userId: 'mem-2',
      userName: 'Sarah Jenkins',
      title: 'Catering Snacks for AI Workshop',
      amount: '$145.50',
      rawAmount: 145.5,
      category: 'Catering',
      date: '2026-10-09',
      status: 'Pending Approval',
      notes: 'Purchased 4 pizza boxes and soda drinks from Campus Diner',
    },
    {
      id: 'rmb-2',
      claimNumber: 'CLM-103',
      userId: 'mem-3',
      userName: 'Alex Rivera',
      title: 'Poster Printing & Promotional Banners',
      amount: '$82.00',
      rawAmount: 82.0,
      category: 'Marketing',
      date: '2026-10-07',
      status: 'Approved',
      notes: 'PrintShop invoice #8812 attached',
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'General Body Meeting Scheduled for Thursday',
      body: 'Join us this Thursday at 6:00 PM in Hall A for our monthly all-hands update. Agenda items include Fall hackathon logistics, budget allocations, and new member introductions.',
      date: '2026-10-10',
      category: 'Meeting',
      author: 'Komal Bhatia',
      priority: 'High',
      audience: 'All Members',
      pinned: true,
    },
    {
      id: 'ann-2',
      title: 'Reimbursement Deadline for October Events',
      body: 'Please submit all expense claims for September & early October events by Friday midnight. Late receipts will not be processed until the next financial cycle.',
      date: '2026-10-08',
      category: 'Finance',
      author: 'Alex Rivera',
      priority: 'Medium',
      audience: 'All Members',
      pinned: false,
    },
  ],
  volunteerTasks: [
    {
      id: 'tsk-1',
      title: 'Setup Welcome Desk & QR Scanner at Hall A',
      department: 'Logistics',
      assignee: 'Sarah Jenkins',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-10-24',
      notes: 'Ensure 2 tablets and QR code printed signs are ready by 8:30 AM.',
      progress: 50,
    },
    {
      id: 'tsk-2',
      title: 'Design Social Media Promo Banners',
      department: 'Marketing',
      assignee: 'Elena Rostova',
      status: 'Completed',
      priority: 'Medium',
      dueDate: '2026-10-20',
      notes: 'Exported in 1080x1080 and 1080x1920 formats for Instagram.',
      progress: 100,
    },
  ],
  fundraisingCampaigns: [
    {
      id: 'fnd-1',
      title: 'Annual Robot Build & Hardware Fund',
      target: '$5,000.00',
      raised: '$3,450.00',
      rawTarget: 5000,
      rawRaised: 3450,
      percentage: 69,
      status: 'Active',
      category: 'Hardware',
      endDate: '2026-11-30',
      description: 'Funding microcontrollers, motors, and 3D printing filament for our Maker Lab teams.',
      donorsCount: 28,
    },
  ],
};

class LocalStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.warn('Error reading db.json, initializing fresh store:', e);
    }
    this.saveData(INITIAL_DB);
    return INITIAL_DB;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to db.json:', e);
    }
  }

  public get db(): DatabaseSchema {
    return this.data;
  }

  public commit() {
    this.saveData(this.data);
  }
}

export const store = new LocalStore();
