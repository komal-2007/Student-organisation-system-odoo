function EventCheckIn({ queue }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Check-in</p>
          <h3>Guest queue</h3>
        </div>
      </div>

      <div className="checkin-list">
        {queue.map((guest) => (
          <div key={guest.code} className="checkin-row">
            <div>
              <strong>{guest.name}</strong>
              <small>{guest.code}</small>
            </div>
            <span className={guest.status === 'Checked in' ? 'checkin-status success' : 'checkin-status pending'}>
              {guest.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventCheckIn;
