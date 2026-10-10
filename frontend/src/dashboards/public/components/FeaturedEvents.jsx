import { publicEvents } from '../data/publicMockData';
import EventCard from './EventCard';

function FeaturedEvents() {
  return (
    <div className="public-card-grid event-grid">
      {publicEvents.slice(0, 3).map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default FeaturedEvents;
