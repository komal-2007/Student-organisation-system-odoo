import { ArrowRight, CalendarPlus, Megaphone, Shirt } from 'lucide-react';

function DepartmentQuickActions() {
  const actions = [
    { label: 'New event', icon: CalendarPlus },
    { label: 'Campaign brief', icon: Megaphone },
    { label: 'Merch status', icon: Shirt },
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Quick actions</p>
          <h3>Popular next steps</h3>
        </div>
      </div>

      <div className="quick-action-list">
        {actions.map(({ label, icon: Icon }) => (
          <button type="button" key={label} className="quick-action-item">
            <span className="quick-action-icon"><Icon size={16} /></span>
            <span>{label}</span>
            <ArrowRight size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}

export default DepartmentQuickActions;
