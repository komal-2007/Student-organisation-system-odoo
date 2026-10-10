function DepartmentActivity({ items }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Updates</p>
          <h3>Department activity</h3>
        </div>
      </div>

      <ul className="activity-list">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span className="activity-dot" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DepartmentActivity;
