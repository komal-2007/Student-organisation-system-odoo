import { useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import PublicImage from './PublicImage';
import { publicEvents } from '../data/publicMockData';

function EventDetails() {
  const { eventId } = useParams();
  const event = publicEvents.find((item) => item.id === eventId);
  const [reservationNotice, setReservationNotice] = useState('');

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
                onClick={() =>
                  setReservationNotice(
                    'Reservations require member sign-in. Sign-in and ticket booking are not connected in this prototype.',
                  )
                }
              >
                Reserve a Spot
              </button>
              <Link className="skyline-btn secondary" to="/events">
                Back to Events
              </Link>
            </div>
            {reservationNotice && (
              <p className="action-feedback" role="status">
                {reservationNotice} <Link to="/signin">View sign-in information</Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default EventDetails;
