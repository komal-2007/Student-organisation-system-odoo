import { useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import PublicImage from './PublicImage';
import { publicEvents } from '../data/publicMockData';
import { useAuth } from '../../../services/auth/AuthContext';
import { skylineApi } from '../../../services/api/skylineApi';
import { PaymentCheckoutModal } from '../../../components/PaymentCheckoutModal';

function EventDetails() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const event = publicEvents.find((item) => item.id === eventId) || { id: eventId, title: 'Campus Event', date: '2026-10-24', category: 'General', price: 0 };
  const [reservationNotice, setReservationNotice] = useState('');
  const [issuedTicket, setIssuedTicket] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleReserveSpot = () => {
    if (!user) {
      setReservationNotice('Please sign in to reserve your ticket.');
      return;
    }
    setShowCheckout(true);
  };

  if (!event) {
    return (
      <div className="page-shell public-dashboard-page">
        <PublicNavbar />
        <main className="container not-found-page">
          <p className="eyebrow">Event not found</p>
          <h1>This event may have moved or ended.</h1>
          <Link className="skyline-btn primary" to="/events">Browse events</Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const formatPrice = (price) => (price === 0 ? 'Free' : `$${price}`);
  const formatDate = (date) => {
    const parsedDate = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsedDate.getTime())
      ? date
      : new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(parsedDate);
  };

  return (
    <div className="page-shell public-dashboard-page">
      <PublicNavbar />
      <main className="container event-details-page">
        <div className="event-details-layout">
          <div className="event-details__image-wrap">
            <PublicImage src={event.image} alt={event.title} className="event-details__image" />
          </div>

          <div className="event-details__content">
            <p className="eyebrow">{event.category}</p>
            <h1>{event.title}</h1>
            <div className="event-details__meta">
              <span>
                <CalendarDays size={16} />
                {formatDate(event.date)} • {event.time}
              </span>
              <span>
                <MapPin size={16} />
                {event.venue}
              </span>
            </div>

            <p className="event-description">{event.description}</p>

            <div className="ticket-pricing">
              <div>
                <span className="ticket-label">Member</span>
                <strong>{formatPrice(event.memberPrice ?? event.price)}</strong>
              </div>
              <div>
                <span className="ticket-label">Non-member</span>
                <strong>{formatPrice(event.price)}</strong>
              </div>
            </div>

            {(event.availability || event.capacity != null) && (
              <div className="event-capacity-row">
                {event.availability && (
                  <span>
                    <Users size={16} />
                    {event.availability}
                  </span>
                )}
                {event.capacity != null && <span>Capacity: {event.capacity}</span>}
              </div>
            )}

            {event.schedule?.length > 0 && (
              <div className="event-schedule">
                <h3>Schedule</h3>
                <ul>
                  {event.schedule.map((slot) => (
                    <li key={slot}>{slot}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="event-actions">
              <button
                type="button"
                className="skyline-btn primary"
                onClick={handleReserveSpot}
              >
                Reserve Ticket via Payment Gateway
              </button>
              <Link className="skyline-btn secondary" to="/events">
                Back to Events
              </Link>
            </div>
            {reservationNotice && (
              <p className="action-feedback" role="status" style={{ padding: '12px', borderRadius: '6px', background: issuedTicket ? '#ECFDF3' : '#F4F5FB', color: issuedTicket ? '#027A48' : '#101426', marginTop: '12px' }}>
                {reservationNotice} {!user && <Link to="/signin">Sign In Now</Link>}
              </p>
            )}
          </div>
        </div>
      </main>
      <PaymentCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        type="ticket"
        item={event}
        user={user}
        onSuccess={(result) => {
          if (result?.ticket) {
            setIssuedTicket(result.ticket);
            setReservationNotice(`Success! Ticket #${result.ticket.ticketNumber} confirmed and issued for ${user?.name || 'you'}.`);
          }
        }}
      />
      <PublicFooter />
    </div>
  );
}

export default EventDetails;
