import { getAccessToken } from '../auth/authService';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api').replace(/\/+$/, '');
const DATA_SYNC_EVENT = 'skyline:data-sync';

async function getHeaders() {
  const accessToken = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export function notifyDataRefresh(scope = 'all') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DATA_SYNC_EVENT, { detail: { scope } }));
}

export function subscribeToDataRefresh(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (event) => handler?.(event.detail?.scope || 'all');
  window.addEventListener(DATA_SYNC_EVENT, listener);
  return () => window.removeEventListener(DATA_SYNC_EVENT, listener);
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(await getHeaders()),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const skylineApi = {
  // Events
  getEvents: () => request('/events'),
  createEvent: (eventData) => request('/events', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (id, eventData) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  checkoutTicket: (payload) => request('/events/tickets/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  getMyTickets: (userId) => request(`/events/tickets/my-tickets${userId ? `?userId=${userId}` : ''}`),
  verifyTicketQr: (qrToken) => request('/events/tickets/verify-qr', { method: 'POST', body: JSON.stringify({ qrToken }) }),

  // Merchandise & Orders
  getMerchandise: () => request('/merchandise'),
  checkoutOrder: (payload) => request('/merchandise/orders/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: (userId) => request(`/merchandise/orders/my-orders${userId ? `?userId=${userId}` : ''}`),

  // Payment Gateway
  createCheckoutSession: (payload) => request('/payments/checkout-session', { method: 'POST', body: JSON.stringify(payload) }),
  verifyPayment: (payload) => request('/payments/verify-payment', { method: 'POST', body: JSON.stringify(payload) }),

  // Finance & Treasury
  getFinanceSummary: () => request('/finance/summary'),
  addTransaction: (txData) => request('/finance/transactions', { method: 'POST', body: JSON.stringify(txData) }),
  getReimbursements: () => request('/finance/reimbursements'),
  submitReimbursement: (claimData) => request('/finance/reimbursements', { method: 'POST', body: JSON.stringify(claimData) }),
  updateReimbursementStatus: (id, status) => request(`/finance/reimbursements/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Announcements
  getAnnouncements: () => request('/announcements'),
  createAnnouncement: (annData) => request('/announcements', { method: 'POST', body: JSON.stringify(annData) }),

  // Volunteers & Tasks
  getVolunteerTasks: () => request('/volunteers'),
  createVolunteerTask: (taskData) => request('/volunteers', { method: 'POST', body: JSON.stringify(taskData) }),
  updateTaskStatus: (id, payload) => request(`/volunteers/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Fundraising
  getFundraisingCampaigns: () => request('/fundraising'),
  createFundraisingCampaign: (campData) => request('/fundraising', { method: 'POST', body: JSON.stringify(campData) }),
  updateFundraisingCampaign: (id, campData) => request(`/fundraising/${id}`, { method: 'PUT', body: JSON.stringify(campData) }),

  // Member Directory Admin
  getMembers: () => request('/admin/members'),
  updateMemberRole: (id, role, department) => request(`/admin/members/${id}/role`, { method: 'PUT', body: JSON.stringify({ role, department }) }),
  updateMemberStatus: (id, status) => request(`/admin/members/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  removeMember: (id) => request(`/admin/members/${id}`, { method: 'DELETE' }),
};
