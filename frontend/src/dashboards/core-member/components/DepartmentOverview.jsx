import { CalendarClock, FolderKanban, Sparkles } from 'lucide-react';

function DepartmentOverview({ summary }) {
  return (
    <section className="panel panel-hero">
      <div>
        <p className="panel-kicker">Department overview</p>
        <h2>{summary.name}</h2>
        <p className="panel-role">{summary.role}</p>
        <p className="panel-summary">{summary.welcomeMessage}</p>
      </div>
      <div className="hero-badges">
        <div>
          <FolderKanban size={16} />
          <span>Open tasks</span>
          <strong>16</strong>
        </div>
        <div>
          <CalendarClock size={16} />
          <span>Due soon</span>
          <strong>5</strong>
        </div>
        <div>
          <Sparkles size={16} />
          <span>Completed</span>
          <strong>42</strong>
        </div>
      </div>
    </section>
  );
}

export default DepartmentOverview;
