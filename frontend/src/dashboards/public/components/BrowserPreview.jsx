import { ArrowRight, CalendarDays, MapPin, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { merchandise, publicEvents, formatMerchandisePrice } from '../data/publicMockData';
import PublicImage from './PublicImage';

function formatEventDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(parsed);
}

function BrowserPreview() {
  const event = publicEvents[0];

  return (
    <section className="browser-preview container" aria-label="Skyline events and merchandise preview">
      <div className="browser-preview__bar" aria-hidden="true">
        <span className="browser-preview__controls"><i /><i /><i /></span>
        <span className="browser-preview__address">skyline.club / discover</span>
        <span className="browser-preview__bar-mark">S</span>
      </div>

      <div className="browser-preview__page">
        <div className="preview-section-heading">
          <div><span className="preview-eyebrow">On the calendar</span><h2>Good things are coming up.</h2></div>
          <Link to="/events" className="preview-text-link">All events <ArrowRight size={15} /></Link>
        </div>

        <article className="preview-featured-event">
          <Link to={`/events/${event.id}`} className="preview-event-image-link" aria-label={`View ${event.title}`}>
            <PublicImage src={event.image} alt="" loading="lazy" className="preview-event-image" />
          </Link>
          <div className="preview-event-copy">
            <span className="preview-category">{event.category}</span>
            <h3><Link to={`/events/${event.id}`}>{event.title}</Link></h3>
            <div className="preview-event-meta">
              <span><CalendarDays size={14} />{formatEventDate(event.date)} · {event.time}</span>
              <span><MapPin size={14} />{event.venue}</span>
            </div>
            <p>{event.description}</p>
            <Link to={`/events/${event.id}`} className="preview-event-button">View Event <ArrowRight size={15} /></Link>
          </div>
        </article>

        <div className="preview-merch-heading">
          <div><span className="preview-eyebrow">From the club store</span><h2>Campus, in good company.</h2></div>
          <Link to="/merchandise" className="preview-text-link">Shop all <ArrowRight size={15} /></Link>
        </div>
        <div className="preview-product-grid">
          {merchandise.slice(0, 3).map((product) => (
            <Link className="preview-product" key={product.id} to={`/products/${product.id}`}>
              <PublicImage src={product.image} alt="" loading="lazy" className="preview-product-image" />
              <span className="preview-product-info"><span><strong>{product.name}</strong><small>{formatMerchandisePrice(product.price)}</small></span><ShoppingBag size={15} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </div>
      <p className="preview-data-note">A preview of the Skyline public calendar and club store · sample content</p>
    </section>
  );
}

export default BrowserPreview;
