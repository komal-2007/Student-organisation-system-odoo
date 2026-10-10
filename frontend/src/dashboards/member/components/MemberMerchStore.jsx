import React, { useState } from 'react';

/* ── Outline SVG Icons ── */
const IconShoppingBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function MemberMerchStore({ catalog = [], myOrders = [] }) {
  const [orders, setOrders] = useState(myOrders);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const newOrder = {
      id: `ord-${Date.now()}`,
      item: selectedItem.name,
      price: selectedItem.price,
      orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Processing',
      pickupLocation: 'Club Room 204 (Wed 4-6 PM)',
    };
    setOrders((prev) => [newOrder, ...prev]);
    setOrderComplete(true);
    setTimeout(() => {
      setSelectedItem(null);
      setOrderComplete(false);
    }, 1800);
  };

  return (
    <div className="member-merch-section">
      {/* ── Catalog Section ── */}
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconShoppingBag />
              <span>Skyline Club Merchandise & Gear</span>
            </h3>
            <p className="skyline-card-subtitle">
              Exclusive campus organization hoodies, stickers, and swag available for club members
            </p>
          </div>
        </div>

        <div className="merch-grid-cards">
          {catalog.map((mch) => (
            <div key={mch.id} className="merch-item-card">
              <div className="merch-img-fallback">
                <div className="merch-logo-badge">SKYLINE</div>
                <div className="merch-item-name-preview">{mch.name}</div>
              </div>

              <div className="merch-content-box">
                <div className="merch-tag-row">
                  <span className="skyline-badge badge-low">{mch.category}</span>
                  <span className="stock-tag">In Stock</span>
                </div>
                <h4 className="merch-title">{mch.name}</h4>
                <p className="merch-desc">{mch.description}</p>

                <div className="merch-bottom-row">
                  <span className="merch-price-tag">{mch.price}</span>
                  <button
                    type="button"
                    className="btn-order-action"
                    onClick={() => setSelectedItem(mch)}
                  >
                    Order Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── My Personal Orders ── */}
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconShoppingBag />
              <span>My Merchandise Orders</span>
            </h3>
            <p className="skyline-card-subtitle">Personal order tracking and campus pickup instructions</p>
          </div>
          <span className="skyline-badge badge-active">{orders.length} Total Orders</span>
        </div>

        {/* Visual Orders Grid Cards */}
        <div className="orders-visual-grid">
          {orders.map((ord) => (
            <div key={ord.id} className="order-visual-card">
              <div className="order-visual-left">
                <div className="order-icon-badge">
                  <IconShoppingBag />
                </div>
                <div className="order-details-col">
                  <h4 className="order-item-title">{ord.item}</h4>
                  <div className="order-meta-info">
                    <span>Order #{ord.id}</span>
                    <span>• Placed on {ord.orderDate}</span>
                    <span>• Pickup: {ord.pickupLocation || 'Club Room 204'}</span>
                  </div>
                </div>
              </div>

              <div className="order-visual-right">
                <span className="order-price-display">{ord.price}</span>
                <span className={`skyline-badge ${ord.status === 'Fulfilled' ? 'badge-approved' : 'badge-pending'}`}>
                  {ord.status}
                </span>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#667085', background: '#F4F5FB', borderRadius: '10px' }}>
              You have not placed any merchandise orders yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Order Modal ── */}
      {selectedItem && (
        <div className="skyline-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="skyline-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="skyline-modal-header">
              <h3>Confirm Member Order</h3>
              <button onClick={() => setSelectedItem(null)}>&times;</button>
            </div>
            {orderComplete ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#059669' }}>
                <IconCheck />
                <p style={{ fontWeight: 700, fontSize: '15px', marginTop: '8px' }}>
                  Order Placed Successfully!
                </p>
                <p style={{ fontSize: '13px', color: '#667085' }}>
                  Pick up your {selectedItem.name} at Club Room 204 during executive office hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="skyline-modal-body">
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F4F5FB',
                  borderRadius: '8px',
                  border: '1px solid #E2E6F0',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px' }}>
                    {selectedItem.name}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#667085', margin: '0 0 8px' }}>
                    {selectedItem.description}
                  </p>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#7257E8' }}>
                    {selectedItem.price}
                  </div>
                </div>

                <div className="form-group">
                  <label>Size / Variant (if applicable)</label>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E6F0' }}>
                    <option value="M">Medium (Standard)</option>
                    <option value="S">Small</option>
                    <option value="L">Large</option>
                    <option value="XL">Extra Large</option>
                    <option value="NA">One Size / Not Applicable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Pickup Location</label>
                  <input type="text" readOnly value="Club Room 204 (Wed 4:00 PM – 6:00 PM)" />
                </div>

                <div className="skyline-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setSelectedItem(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Confirm & Place Order
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberMerchStore;
