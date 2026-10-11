import React, { useState } from 'react';
import { skylineApi } from '../../../services/api/skylineApi';

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

import { PaymentCheckoutModal } from '../../../components/PaymentCheckoutModal';
import { useAuth } from '../../../services/auth/AuthContext';

export function MemberMerchStore({ catalog = [], myOrders = [] }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState(myOrders);
  const [selectedItem, setSelectedItem] = useState(null);

  React.useEffect(() => {
    setOrders(myOrders || []);
  }, [myOrders]);

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
      {/* ── Order Checkout Modal via Payment Gateway ── */}
      <PaymentCheckoutModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        type="merchandise"
        item={selectedItem}
        user={user}
        onSuccess={(result) => {
          if (result?.order) {
            setOrders((prev) => [result.order, ...prev]);
          }
        }}
      />
    </div>
  );
}

export default MemberMerchStore;
