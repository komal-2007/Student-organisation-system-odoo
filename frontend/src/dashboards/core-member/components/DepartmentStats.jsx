function DepartmentStats({ stats }) {
  return (
    <section className="stats-grid">
      {stats.map((stat) => (
        <article key={stat.label} className={`stat-item ${stat.tone}`}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </article>
      ))}
    </section>
  );
}

export default DepartmentStats;
