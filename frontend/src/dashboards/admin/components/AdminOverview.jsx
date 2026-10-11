import React, { useState } from 'react';

/* ── SVG Outline Icons ── */
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconTrending = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export function AdminOverview({ data }) {
  const [items, setItems] = useState(data.pendingActions || []);
  const [selectedItem, setSelectedItem] = useState(null);

  React.useEffect(() => {
    setItems(data.pendingActions || []);
    setSelectedItem((current) => {
      if (!current) return null;
      return (data.pendingActions || []).find((item) => item.id === current.id) || null;
    });
  }, [data.pendingActions]);

  const handleReview = (item) => {
    setSelectedItem(item);
  };

  const handleApprove = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setSelectedItem(null);
  };

  const getBorderColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#FF8B82';
      case 'medium': return '#4D9CFF';
      case 'low': return '#45D6C5';
      default: return '#7257E8';
    }
  };

  const getBadgeStyle = (urgency) => {
    switch (urgency) {
      case 'high':
        return {
          backgroundColor: '#FFF0EF',
          color: '#DC2626',
          border: '1px solid #FED7D7',
        };
      case 'medium':
        return {
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
          border: '1px solid #BFDBFE',
        };
      case 'low':
        return {
          backgroundColor: '#ECFDF5',
          color: '#0D9488',
          border: '1px solid #A7F3D0',
        };
      default:
        return {
          backgroundColor: '#F5F3FF',
          color: '#7257E8',
          border: '1px solid #DDD6FE',
        };
    }
  };

  return (
    <div className="admin-overview-wrapper">
      {/* ── Urgent Actions & Pending Approvals Card ── */}
      <div className="skyline-card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#101426'
            }}>
              <IconClock />
              <span>Urgent Actions & Pending Approvals</span>
            </div>
            <p style={{ fontSize: '13px', color: '#667085', margin: '4px 0 0 0' }}>
              Operational items requiring executive sign-off or review
            </p>
          </div>
          <span style={{
            backgroundColor: '#FFF0EF',
            color: '#FF8B82',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            {items.length} PENDING
          </span>
        </div>

        <div className="skyline-pending-list">
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                marginBottom: '10px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #E2E6F0',
                borderLeft: `4px solid ${getBorderColor(item.urgency)}`,
                transition: 'box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  ...getBadgeStyle(item.urgency)
                }}>
                  {item.urgency}
                </span>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#101426' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#667085', marginTop: '2px' }}>
                    {item.date}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleReview(item)}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E6F0',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#101426',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4F5FB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                Review Request
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: '#667085',
              fontSize: '13.5px'
            }}>
              All pending action items have been reviewed and approved!
            </div>
          )}
        </div>
      </div>

      {/* ── Dual Bottom Cards: Upcoming Event Capacity & Monthly Treasury Target ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {/* Upcoming Event Capacity */}
        <div className="skyline-card" style={{ margin: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#101426'
              }}>
                <IconCalendar />
                <span>Upcoming Event Capacity</span>
              </div>
              <p style={{ fontSize: '13px', color: '#667085', margin: '4px 0 0 0' }}>
                Real-time registration capacity meter
              </p>
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#101426',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              View All
            </button>
          </div>

          <div>
            {(data.overviewEvents || []).map((evt) => {
              const percent = Math.round((evt.registered / evt.capacity) * 100);
              return (
                <div key={evt.id} style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    marginBottom: '6px'
                  }}>
                    <strong style={{ color: '#101426', fontWeight: 600 }}>{evt.title}</strong>
                    <span style={{ color: '#7257E8', fontWeight: 700 }}>
                      {evt.registered} / {evt.capacity} ({percent}%)
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#F4F5FB',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: 'linear-gradient(135deg, #7257E8 0%, #4D9CFF 100%)',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Treasury Target */}
        <div className="skyline-card" style={{ margin: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#101426'
              }}>
                <IconTrending />
                <span>Monthly Treasury Target</span>
              </div>
              <p style={{ fontSize: '13px', color: '#667085', margin: '4px 0 0 0' }}>
                Budget collection progress
              </p>
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#101426',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              View Ledger
            </button>
          </div>

          <div style={{ padding: '8px 0 0' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#101426', lineHeight: 1.1 }}>
              {data.financeSummary?.netBalance || '$12,450.00'}
            </div>
            <div style={{ fontSize: '13px', color: '#667085', margin: '6px 0 16px' }}>
              Target: {data.financeSummary?.monthlyGoal || '$15,000.00'} ({data.financeSummary?.monthlyGoalPercent || 83}% Achieved)
            </div>
            <div style={{
              height: '10px',
              backgroundColor: '#F4F5FB',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${data.financeSummary?.monthlyGoalPercent || 83}%`,
                background: 'linear-gradient(135deg, #45D6C5 0%, #4D9CFF 100%)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Review Item Modal ── */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(16, 20, 38, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #E2E6F0',
            padding: '24px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#101426', margin: '0 0 8px' }}>
              Review Request
            </h3>
            <p style={{ fontSize: '13.5px', color: '#667085', margin: '0 0 16px' }}>
              {selectedItem.title}
            </p>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#F4F5FB',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#101426',
              marginBottom: '20px'
            }}>
              <div><strong>Urgency:</strong> {selectedItem.urgency.toUpperCase()}</div>
              <div><strong>Requested:</strong> {selectedItem.date}</div>
              <div><strong>Type:</strong> {selectedItem.type}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E6F0',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#667085',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedItem.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#059669',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Approve & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOverview;
