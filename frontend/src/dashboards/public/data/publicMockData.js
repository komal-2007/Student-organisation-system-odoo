export const publicEvents = [
  {
    id: 'campus-summit',
    title: 'Skyline Campus Summit',
    category: 'Conference',
    date: '2026-11-08',
    time: '6:00 PM',
    venue: 'Innovation Hall',
    price: 18,
    memberPrice: 12,
    availability: '42 seats left',
    capacity: 180,
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
    description:
      'A high-energy campus leadership summit where students connect with founders, campus organizers, and community partners around student-led innovation.',
    schedule: ['6:00 PM — Welcome and networking', '6:30 PM — Leadership panel', '7:15 PM — Breakout sessions', '8:00 PM — Closing mixer'],
  },
  {
    id: 'night-market',
    title: 'Night Market & Makers Fair',
    category: 'Community',
    date: '2026-11-15',
    time: '5:30 PM',
    venue: 'Student Plaza',
    price: 0,
    memberPrice: 0,
    availability: 'Open to all',
    capacity: 500,
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    description:
      'Browse student makers, pop-up food stalls, creative workshops, and live music under a glowing campus night market.',
    schedule: ['5:30 PM — Vendor setup', '6:00 PM — Live music', '7:00 PM — Maker demos', '8:30 PM — Campus social hour'],
  },
  {
    id: 'hack-night',
    title: 'Hack Night Sprint',
    category: 'Hackathon',
    date: '2026-11-22',
    time: '7:00 PM',
    venue: 'Creative Lab',
    price: 15,
    memberPrice: 10,
    availability: '18 teams registered',
    capacity: 120,
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    description:
      'A collaborative sprint for builders, designers, and developers, with quick-start challenges and peer mentoring throughout the night.',
    schedule: ['7:00 PM — Team formation', '7:30 PM — Challenge kickoff', '9:00 PM — Mentorship roundtables', '11:00 PM — Final showcase'],
  },
  {
    id: 'wellness-walk',
    title: 'Wellness Walk + Sunrise Yoga',
    category: 'Health',
    date: '2026-11-29',
    time: '8:00 AM',
    venue: 'North Lawn',
    price: 0,
    memberPrice: 0,
    availability: 'Almost full',
    capacity: 90,
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80',
    description:
      'Start the day with a campus wellness walk, guided yoga, and reflection sessions tailored to student life and stress relief.',
    schedule: ['8:00 AM — Check-in and stretch', '8:30 AM — Guided walk', '9:15 AM — Yoga flow', '9:45 AM — Breakfast social'],
  },
];

export const merchandise = [
  {
    id: 'skyline-hoodie',
    name: 'Skyline Core Hoodie',
    price: 3499,
    currency: 'INR',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 'In stock',
    image:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    description: 'A heavyweight fleece hoodie for cooler nights, study sessions, and campus events.',
  },
  {
    id: 'campus-tote',
    name: 'Campus Utility Tote',
    price: 1299,
    currency: 'INR',
    sizes: ['One size'],
    stock: 'Low stock',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    description: 'Roomy, durable, and ready for library runs, conferences, and everyday campus carry.',
  },
  {
    id: 'club-tee',
    name: 'Club Everyday Tee',
    price: 999,
    currency: 'INR',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 'In stock',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    description: 'A crisp everyday shirt with a soft touch and embroidered Skyline mark.',
  },
  {
    id: 'notebook-kit',
    name: 'Studio Notebook Set',
    price: 599,
    currency: 'INR',
    sizes: ['Standard'],
    stock: 'Made to order',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
    description: 'A set of planner, sketch, and meeting notebooks built for student workflows.',
  },
];

export function formatMerchandisePrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export const clubHighlights = [
  { label: 'student clubs', value: '18+' },
  { label: 'campus events', value: '120+' },
  { label: 'members engaged', value: '4.8k' },
];

export default { publicEvents, merchandise, clubHighlights, formatMerchandisePrice };
