function FundraiserProgress({ progress }) {
  const percent = (progress.raised / progress.goal) * 100;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Fundraising</p>
          <h3>Campaign progress</h3>
        </div>
      </div>

      <div className="fundraiser-card">
        <div className="fundraiser-amounts">
          <strong>${progress.raised.toLocaleString()}</strong>
          <span>of ${progress.goal.toLocaleString()} goal</span>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="fundraiser-meta">
          <span>{progress.supporters} supporters</span>
          <span>Target: {progress.targetDate}</span>
        </div>
      </div>
    </section>
  );
}

export default FundraiserProgress;
