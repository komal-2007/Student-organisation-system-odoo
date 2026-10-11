import { ArrowRight, CalendarDays, MapPin, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicImage from './PublicImage';

function formatPrice(price) {
  return price === 0 ? 'Free' : `$${price}`;
}

function formatDate(date) {
  const parsedDate = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(parsedDate);
}

function EventCard({ event }) {
  return (
    <article className="event-card">
      <PublicImage src={event.image} alt="" loading="lazy" className="event-card__image" />
      <div className="event-card__content">
        <span className="event-tag">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="event-card__description">{event.description}</p>

        <div className="event-meta">
          <span>
            <CalendarDays size={15} />
            {formatDate(event.date)} • {event.time}
          </span>
          <span>
            <MapPin size={15} />
            {event.venue}
          </span>
        </div>

        <div className="event-card__footer">
          <div className="event-price-row">
            <Ticket size={15} />
            <span>{formatPrice(event.price)}</span>
          </div>
          {event.availability && <span className="availability-pill">{event.availability}</span>}
        </div>

        <Link className="skyline-btn secondary event-link" to={`/events/${event.id}`}>
          View Event <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default EventCard;
