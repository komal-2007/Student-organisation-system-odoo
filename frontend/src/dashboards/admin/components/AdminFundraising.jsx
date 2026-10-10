import React, { useState, useMemo, useEffect } from 'react';
import { skylineApi } from '../../../services/api/skylineApi';

/* ==========================================================================
   ADMIN FUNDRAISING CAMPAIGNS — Full Management Hub (MOCK)
   Person 2: Replace local state mutations with API calls:
   - GET  /api/admin/fundraising/campaigns
   - POST /api/admin/fundraising/campaigns
   - PUT  /api/admin/fundraising/campaigns/:id
   ========================================================================== */

/* ── Inline SVG Icons ── */
const Icon = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconSearch = () => (
  <Icon size={16}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);
const IconPlus = () => (
  <Icon size={16}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
);
const IconX = () => (
  <Icon size={18}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
);
const IconEye = () => (
  <Icon size={15}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const TABS = [
  { id: 'all', label: 'All Campaigns' },
  { id: 'Active', label: 'Active' },
  { id: 'Completed', label: 'Completed' },
];

const INITIAL_FORM = {
  title: '', target: '', category: 'Hardware', endDate: '', description: ''
};

const normalizeCampaign = (campaign) => {
  if (!campaign) return null;
  const rawTarget = Number(campaign.rawTarget ?? (typeof campaign.target === 'string' ? Number(String(campaign.target).replace(/[^0-9.]/g, '')) : 0));
  const rawRaised = Number(campaign.rawRaised ?? (typeof campaign.raised === 'string' ? Number(String(campaign.raised).replace(/[^0-9.]/g, '')) : 0));
  const percentage = Number.isFinite(campaign.percentage)
    ? campaign.percentage
    : rawTarget > 0 ? Math.min(100, Math.round((rawRaised / rawTarget) * 100)) : 0;
  return { ...campaign, rawTarget, rawRaised, percentage, status: campaign.status || 'Active', donorsCount: campaign.donorsCount || 0 };
};

export function AdminFundraising({ campaigns: initialCampaigns }) {
  const [campaigns, setCampaigns] = useState((initialCampaigns || []).map(normalizeCampaign).filter(Boolean));
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (initialCampaigns) {
      setCampaigns((initialCampaigns || []).map(normalizeCampaign).filter(Boolean));
    }
  }, [initialCampaigns]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [detailCmp, setDetailCmp] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const filtered = useMemo(() => {
    let list = campaigns;
    if (activeTab !== 'all') {
      list = list.filter(c => c.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [campaigns, activeTab, search]);

  const totals = useMemo(() => {
    const raisedSum = campaigns.reduce((acc, c) => acc + (c.rawRaised || 0), 0);
    const targetSum = campaigns.reduce((acc, c) => acc + (c.rawTarget || 0), 0);
    return {
      raised: `$${raisedSum.toLocaleString()}`,
      target: `$${targetSum.toLocaleString()}`,
      activeCount: campaigns.filter(c => c.status === 'Active').length,
    };
  }, [campaigns]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title || !form.target) return;

    const rawTarget = Number.parseFloat(String(form.target));
    if (!Number.isFinite(rawTarget) || rawTarget <= 0) {
      flash('Please enter a valid fundraising target greater than zero.');
      return;
    }

    try {
      const response = await skylineApi.createFundraisingCampaign({
        title,
        target: rawTarget,
        category: form.category,
        endDate: form.endDate || '2026-12-31',
        description: form.description,
      });
      const createdCampaign = normalizeCampaign(response?.campaign || response);
      setCampaigns((prev) => (createdCampaign ? [createdCampaign, ...prev] : prev));
      flash(`Launched campaign "${title}"`);
      setShowModal(false);
      setForm(INITIAL_FORM);
    } catch (error) {
      flash(error?.message || 'Unable to launch the fundraising campaign.');
    }
  };

  return (
    <div className="admin-fundraising-section">
      {/* Toast */}
      {successMsg && <div className="admin-events-toast">{successMsg}</div>}

      {/* Overview Stat Cards */}
      <div className="finance-summary-pills" style={{ marginBottom: 20 }}>
        <div className="pill-stat income">Total Raised: {totals.raised}</div>
        <div className="pill-stat balance">Fundraising Target: {totals.target}</div>
        <div className="pill-stat income" style={{ background: '#E8F2FF', color: '#4D9CFF' }}>
          Active Drives: {totals.activeCount}
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-events-toolbar">
        <div className="admin-events-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-events-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-events-toolbar-right">
          <div className="admin-events-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="btn-create-event" onClick={() => setShowModal(true)}>
            <IconPlus /> New Campaign
          </button>
        </div>
      </div>

      {/* Campaign Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="skyline-card" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center' }}>
            <p className="admin-events-empty-title">No fundraising campaigns found</p>
          </div>
        ) : (
          filtered.map(cmp => (
            <div key={cmp.id} className="skyline-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span className="admin-events-category-chip">{cmp.category || 'Fundraiser'}</span>
                  <span className={`skyline-badge ${cmp.status === 'Active' ? 'badge-approved' : 'badge-low'}`}>
                    {cmp.status}
                  </span>
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#101426', margin: '0 0 6px' }}>{cmp.title}</h4>
                <p style={{ fontSize: 13, color: '#667085', margin: '0 0 16px', lineHeight: 1.4 }}>
                  {cmp.description || 'Organization fundraising drive.'}
                </p>
              </div>

              <div>
                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: '#101426' }}>{cmp.raised}</span>
                    <span style={{ color: '#667085' }}>Target: {cmp.target} ({cmp.percentage}%)</span>
                  </div>
                  <div className="admin-events-capacity-bar" style={{ height: 8 }}>
                    <div
                      className="admin-events-capacity-fill"
                      style={{
                        width: `${Math.min(cmp.percentage, 100)}%`,
                        background: cmp.percentage >= 100 ? '#059669' : 'linear-gradient(90deg, #7257E8, #4D9CFF)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F0F1F5' }}>
                  <span style={{ fontSize: 12, color: '#667085' }}>{cmp.donorsCount || 0} supporters</span>
                  <button className="btn-table" onClick={() => setDetailCmp(cmp)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <IconEye /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Campaign Modal */}
      {showModal && (
        <div className="admin-events-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-events-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Launch Fundraising Campaign</h3>
              <button className="admin-events-modal-close" onClick={() => setShowModal(false)}><IconX /></button>
            </div>

            <form onSubmit={handleCreate} className="admin-events-form">
              <div className="form-field">
                <label>Campaign Title <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Annual Robot Build & Hardware Fund"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Fundraising Target ($ USD) <span className="req">*</span></label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={form.target}
                    onChange={e => setForm({ ...form, target: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="Hardware">Hardware & Equipment</option>
                    <option value="Scholarship">Scholarships & Grants</option>
                    <option value="Travel">Travel & Competitions</option>
                    <option value="Events">Special Events</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Target End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Campaign Description</label>
                <textarea
                  rows="3"
                  placeholder="Explain what the funds will be used for..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="admin-events-modal-actions">
                <button type="button" className="btn-table" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-create-event">Launch Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Detail Drawer */}
      {detailCmp && (
        <div className="admin-events-overlay" onClick={() => setDetailCmp(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Campaign Details</h3>
              <button className="admin-events-modal-close" onClick={() => setDetailCmp(null)}><IconX /></button>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{detailCmp.title}</h4>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <span className="admin-events-category-chip">{detailCmp.category}</span>
              <span className={`skyline-badge ${detailCmp.status === 'Active' ? 'badge-approved' : 'badge-low'}`}>{detailCmp.status}</span>
            </div>

            <p style={{ fontSize: 13, color: '#101426', lineHeight: 1.5, background: '#F9FAFB', padding: 12, borderRadius: 8 }}>
              {detailCmp.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, margin: '16px 0' }}>
              <div><strong>Raised:</strong> {detailCmp.raised}</div>
              <div><strong>Target:</strong> {detailCmp.target}</div>
              <div><strong>Progress:</strong> {detailCmp.percentage}%</div>
              <div><strong>Supporters:</strong> {detailCmp.donorsCount}</div>
            </div>

            <div className="admin-events-modal-actions">
              <button className="btn-table" onClick={() => setDetailCmp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFundraising;
