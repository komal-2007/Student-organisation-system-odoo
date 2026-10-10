function UpcomingDepartmentEvents({ events }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Calendar</p>
          <h3>Upcoming events</h3>
        </div>
      </div>

      <div className="event-mini-list">
        {events.map((event) => (
          <div key={`${event.title}-${event.date}`} className="event-mini-item">
            <div className="event-date-box">
              <span>{event.date.split(' ')[0]}</span>
              <strong>{event.date.split(' ')[1] || '12'}</strong>
            </div>
            <div>
              <strong>{event.title}</strong>
              <small>
                {event.time} • {event.location}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UpcomingDepartmentEvents;
