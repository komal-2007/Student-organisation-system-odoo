import React, { useState, useEffect } from 'react';
import { skylineApi, notifyDataRefresh } from '../services/api/skylineApi';
import { RealQRCode } from './RealQRCode';

/**
 * PaymentCheckoutModal
 * End-to-end sandbox payment modal for merchandise orders and event tickets.
 * Communicates with backend /api/payments/checkout-session and /api/payments/verify-payment.
 */
export function PaymentCheckoutModal({
  isOpen,
  onClose,
  type = 'ticket', // 'ticket' | 'merchandise'
  item,
  user,
  onSuccess,
}) {
  const [step, setStep] = useState('init'); // 'init' | 'ready' | 'processing' | 'confirmed' | 'error'
  const [session, setSession] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pickupLocation, setPickupLocation] = useState('Campus Center Room 204');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState(user?.name || 'Student Member');
  const [confirmedResult, setConfirmedResult] = useState(null);

  // Initialize checkout session on open
  useEffect(() => {
    if (!isOpen || !item) {
      setStep('init');
      setSession(null);
      setConfirmedResult(null);
      setErrorMessage('');
      return;
    }

    let active = true;
    async function initSession() {
      setStep('init');
      setErrorMessage('');
      try {
        const data = await skylineApi.createCheckoutSession({
          type,
          itemId: item.id,
          quantity,
          userId: user?.id || user?.username || 'demo-member',
        });
        if (active) {
          setSession(data);
          setStep('ready');
        }
      } catch (err) {
        if (active) {
          setErrorMessage(err.message || 'Failed to initialize payment gateway.');
          setStep('error');
        }
      }
    }

    initSession();
    return () => {
      active = false;
    };
  }, [isOpen, item?.id, quantity, type, user?.id, user?.username]);

  if (!isOpen || !item) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!session?.sessionId) return;

    setStep('processing');
    setErrorMessage('');

    try {
      const result = await skylineApi.verifyPayment({
        sessionId: session.sessionId,
        type,
        itemId: item.id,
        quantity,
        userId: user?.id || user?.username || 'demo-member',
        pickupLocation: type === 'merchandise' ? pickupLocation : undefined,
      });

      if (result.success) {
        setConfirmedResult(result);
        setStep('confirmed');
        notifyDataRefresh(type === 'ticket' ? 'events' : 'merchandise');
        onSuccess?.(result);
      } else {
        throw new Error(result.error || 'Payment verification failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed. Please check your credentials.');
      setStep('ready');
    }
  };

  const formattedAmount = session
    ? `$${session.totalAmount.toFixed(2)}`
    : (item.rawPrice ? `$${(item.rawPrice * quantity).toFixed(2)}` : (item.price || item.ticketPrice || 'Free'));

  return (
    <div className="skyline-modal-overlay" onClick={step === 'processing' ? undefined : onClose}>
      <div
        className="skyline-modal-content"
        style={{ maxWidth: '480px', width: '92%', borderRadius: '12px', padding: '0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E2E6F0',
            backgroundColor: '#FAFAFD',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#101426' }}>
              {step === 'confirmed'
                ? (type === 'ticket' ? 'Ticket Confirmed & Issued' : 'Order Confirmed')
                : (type === 'ticket' ? 'Reserve Ticket via Payment Gateway' : 'Skyline Club Store Checkout')}
            </h3>
            <span style={{ fontSize: '12px', color: '#667085' }}>
              Skyline Sandbox Gateway • Test Mode
            </span>
          </div>
          {step !== 'processing' && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#667085',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FEF3F2',
                color: '#B42318',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                border: '1px solid #FECDCA',
              }}
            >
              {errorMessage}
            </div>
          )}

          {step === 'init' && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#667085' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>Connecting to Payment Gateway...</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>Verifying inventory and prices with server...</div>
            </div>
          )}

          {step === 'confirmed' && confirmedResult && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#D1FADF',
                  color: '#039855',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 14px',
                }}
              >
                ✓
              </div>

              <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px', color: '#101426' }}>
                {type === 'ticket' ? 'Admission Pass Issued!' : 'Merchandise Order Placed!'}
              </h4>
              <p style={{ fontSize: '13px', color: '#667085', margin: '0 0 16px' }}>
                {type === 'ticket'
                  ? `Your ticket for "${item.title}" is confirmed and saved in your student profile.`
                  : `Your order for "${item.name}" has been recorded. Present order confirmation at pickup.`}
              </p>

              {type === 'ticket' && confirmedResult.ticket && (
                <div
                  style={{
                    backgroundColor: '#F4F5FB',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid #E2E6F0',
                    marginBottom: '20px',
                  }}
                >
                  <RealQRCode
                    token={confirmedResult.ticket.qrToken}
                    size={130}
                    label={confirmedResult.ticket.ticketNumber}
                    status={confirmedResult.ticket.status}
                  />
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#475467' }}>
                    <strong>Attendee:</strong> {confirmedResult.ticket.userName}
                  </div>
                </div>
              )}

              {type === 'merchandise' && confirmedResult.order && (
                <div
                  style={{
                    backgroundColor: '#F4F5FB',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid #E2E6F0',
                    textAlign: 'left',
                    fontSize: '13px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Order Number:</strong> {confirmedResult.order.orderNumber}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Item:</strong> {confirmedResult.order.itemName} (x{confirmedResult.order.quantity})
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Total Paid:</strong> ${confirmedResult.order.totalPrice.toFixed(2)}
                  </div>
                  <div>
                    <strong>Pickup Location:</strong> {confirmedResult.order.pickupLocation}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="skyline-btn primary"
                style={{ width: '100%', padding: '10px 16px', fontSize: '14px', borderRadius: '8px' }}
                onClick={onClose}
              >
                Close & Return
              </button>
            </div>
          )}

          {(step === 'ready' || step === 'processing') && (
            <form onSubmit={handlePay}>
              {/* Item Summary Card */}
              <div
                style={{
                  backgroundColor: '#F4F5FB',
                  border: '1px solid #E2E6F0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#101426' }}>
                      {item.title || item.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#667085' }}>
                      {type === 'ticket' ? `${item.date} • ${item.venue || 'Campus Hall'}` : item.category}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#7257E8' }}>
                      {formattedAmount}
                    </div>
                    <span style={{ fontSize: '11px', color: '#667085' }}>
                      Server Verified
                    </span>
                  </div>
                </div>

                {type === 'merchandise' && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E2E6F0' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475467', marginBottom: '4px' }}>
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Sandbox Card Details */}
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#344054' }}>
                    Card Information (Sandbox)
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      backgroundColor: '#EFF8FF',
                      color: '#175CD3',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Test 4242 Card
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Card Number (4242 •••• •••• 4242)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={step === 'processing'}
                  style={{
                    flex: '1',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #D0D5DD',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={step === 'processing'}
                  style={{
                    flex: '2',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#7257E8',
                    color: '#FFFFFF',
                    cursor: step === 'processing' ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {step === 'processing' ? 'Processing Payment...' : `Pay ${formattedAmount} via Sandbox`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentCheckoutModal;
