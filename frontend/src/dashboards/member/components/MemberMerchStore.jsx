import React, { useState } from 'react';

export function MemberMerchStore({ catalog, myOrders }) {
  const [orders, setOrders] = useState(myOrders);

  const handleOrder = (item) => {
    const newOrder = {
      id: `ord-${Date.now()}`,
      item: item.name,
      price: item.price,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Processing',
    };
    setOrders((prev) => [newOrder, ...prev]);
    alert(`Order placed for ${item.name}!`);
  };

  return (
    <div className="member-merch-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Skyline Club Merchandise</h3>
          <p className="skyline-card-subtitle">Official apparel, stickers, and swag for club members</p>
        </div>
        <div className="skyline-card-body">
          <div className="merch-grid">
            {catalog.map((mch) => (
              <div key={mch.id} className="merch-card">
                <img src={mch.image} alt={mch.name} className="merch-img" />
                <div className="merch-details">
                  <h4>{mch.name}</h4>
                  <div className="merch-price">{mch.price}</div>
                  <button className="btn-order-merch" onClick={() => handleOrder(mch)}>
                    Order Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">My Orders</h3>
          <p className="skyline-card-subtitle">Personal order tracking and status</p>
        </div>
        <div className="skyline-card-body">
          <table className="skyline-table">
            <thead>
              <tr>
                <th>Order Item</th>
                <th>Price</th>
                <th>Order Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td><strong>{ord.item}</strong></td>
                  <td>{ord.price}</td>
                  <td>{ord.orderDate}</td>
                  <td><span className="skyline-badge badge-pending">{ord.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MemberMerchStore;
