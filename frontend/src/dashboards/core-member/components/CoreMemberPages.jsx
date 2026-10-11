import { useEffect, useRef, useState } from 'react';
import { ArrowDownUp, ArrowRight, CalendarDays, Check, CircleAlert, FileText, Filter, Megaphone, Plus, Users, X } from 'lucide-react';

const TASK_STATUSES = ['To do', 'In progress', 'Review', 'Completed'];

export function formatDate(value, options = { month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en', options).format(new Date(`${value}T12:00:00`));
}

function PanelHeading({ kicker, title, action, children }) {
  return (
    <div className="panel-header">
      <div>
        <p className="panel-kicker">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {action || children}
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <FileText size={20} aria-hidden="true" />
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

function useDialogAccessibility(onClose) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = dialog.querySelectorAll('button:not([disabled]), select:not([disabled])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return dialogRef;
}

export function OverviewPage({ summary, tasks, events, activity, announcements, participation, query, onViewTask, onViewEvent, onNavigate }) {
  const today = new Date().toISOString().slice(0, 10);
  const search = query.toLowerCase();
  const matchingTasks = tasks.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(search));
  const matchingEvents = events.filter((event) => `${event.title} ${event.location} ${event.responsibility}`.toLowerCase().includes(search));
  const matchingActivity = activity.filter((item) => item.message.toLowerCase().includes(search));
  const matchingAnnouncements = announcements.filter((item) => `${item.title} ${item.body} ${item.channel}`.toLowerCase().includes(search));
  const openTasks = matchingTasks.filter((task) => task.status !== 'Completed');
  const overdueTasks = openTasks.filter((task) => task.dueDate < today);
  const dueSoonTasks = openTasks.filter((task) => task.dueDate >= today && task.dueDate <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  const completedTasks = tasks.filter((task) => task.status === 'Completed');
  const statusTotals = TASK_STATUSES.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length,
  }));
  const maxAttendees = Math.max(...participation.map((item) => item.attendees), 1);

  return (
    <>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <p className="panel-kicker">Department overview</p>
          <h2>{summary.welcomeMessage}</h2>
          <p>{summary.name} <span aria-hidden="true">/</span> {summary.role}</p>
        </div>
        <div className="sample-data-note"><span className="status-dot" /> Sample workspace data</div>
      </section>

      <section className="stats-grid" aria-label="Department summary">
        <article className="stat-item"><span>Assigned tasks</span><strong>{tasks.length}</strong><small>Across your workspace</small></article>
        <article className="stat-item stat-amber"><span>Pending tasks</span><strong>{openTasks.length}</strong><small>{dueSoonTasks.length} due in the next 3 days</small></article>
        <article className="stat-item stat-red"><span>Overdue</span><strong>{overdueTasks.length}</strong><small>Needs attention</small></article>
        <article className="stat-item stat-blue"><span>Upcoming events</span><strong>{events.length}</strong><small>On the department calendar</small></article>
        <article className="stat-item stat-green"><span>Completed</span><strong>{completedTasks.length}</strong><small>Of {tasks.length} assigned</small></article>
      </section>

      <div className="dashboard-columns">
        <section className="panel attention-panel">
          <PanelHeading kicker="Action centre" title="Needs your attention" action={<button className="text-button" type="button" onClick={() => onNavigate('tasks')}>All tasks <ArrowRight size={15} /></button>} />
          {overdueTasks.length + dueSoonTasks.length === 0 ? <EmptyState title={query ? 'No matching tasks need attention' : 'You’re all caught up'} message={query ? 'Try a different search to find more tasks.' : 'No overdue or urgent tasks right now.'} /> : (
            <div className="attention-list">
              {[...overdueTasks, ...dueSoonTasks].slice(0, 4).map((task) => (
                <button className="attention-item" key={task.id} type="button" onClick={() => onViewTask(task.id)}>
                  <span className={`attention-icon ${task.dueDate < today ? 'is-overdue' : ''}`}><CircleAlert size={17} /></span>
                  <span className="attention-copy"><strong>{task.title}</strong><small>{task.dueDate < today ? `Overdue · ${formatDate(task.dueDate)}` : `Due ${formatDate(task.dueDate)}`} · {task.priority} priority</small></span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <PanelHeading kicker="Workload" title="Tasks by status" />
          <div className="status-chart" role="img" aria-label={statusTotals.map(({ status, count }) => `${status}: ${count}`).join(', ')}>
            {statusTotals.map(({ status, count }) => (
              <div className="status-chart-row" key={status}>
                <span>{status}</span>
                <div className="status-track"><span className={`status-fill status-${status.toLowerCase().replaceAll(' ', '-')}`} style={{ width: `${tasks.length ? (count / tasks.length) * 100 : 0}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <PanelHeading kicker="Calendar" title="Upcoming events" action={<button className="text-button" type="button" onClick={() => onNavigate('events')}>View calendar <ArrowRight size={15} /></button>} />
          {matchingEvents.length ? <div className="event-mini-list">
            {matchingEvents.slice(0, 3).map((event) => (
              <button className="event-mini-item" key={event.id} type="button" onClick={() => onViewEvent(event.id)}>
                <span className="event-date-box"><small>{formatDate(event.date, { month: 'short' })}</small><strong>{formatDate(event.date, { day: 'numeric' })}</strong></span>
                <span className="event-mini-copy"><strong>{event.title}</strong><small>{event.time} · {event.location}</small><small className="responsibility">{event.responsibility}</small></span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div> : <EmptyState title={query ? 'No matching events' : 'No upcoming events'} message={query ? 'Try another search term.' : 'New department events will appear here.'} />}
        </section>

        <section className="panel">
          <PanelHeading kicker="Participation" title="Event attendance" />
          <div className="participation-chart" role="img" aria-label="Monthly event attendance from May to October">
            {participation.map((month) => (
              <div className="participation-month" key={month.month}>
                <span className="participation-value">{month.attendees}</span>
                <div className="participation-track"><span style={{ height: `${(month.attendees / maxAttendees) * 100}%` }} /></div>
                <small>{month.month}</small>
              </div>
            ))}
          </div>
          <p className="chart-caption">Attendees at department events · sample data</p>
        </section>
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <PanelHeading kicker="Updates" title="Recent activity" />
          {matchingActivity.length ? <ul className="activity-list">
            {matchingActivity.slice(0, 4).map((item) => <li key={item.id}><span className="activity-dot" /><span>{item.message}<small>{item.time}</small></span></li>)}
          </ul> : <EmptyState title={query ? 'No matching activity' : 'No recent activity'} message={query ? 'Try another search term.' : 'Updates from your department will show here.'} />}
        </section>
        <section className="panel">
          <PanelHeading kicker="Communications" title="Latest announcements" action={<button className="text-button" type="button" onClick={() => onNavigate('announcements')}>Manage <ArrowRight size={15} /></button>} />
          {matchingAnnouncements.length ? matchingAnnouncements.slice(0, 2).map((announcement) => <div className="announcement-preview" key={announcement.id}><div><strong>{announcement.title}</strong><small>{announcement.channel} · {formatDate(announcement.updatedAt)}</small></div><span className={`pill status-pill-${announcement.status.toLowerCase().replaceAll(' ', '-')}`}>{announcement.status}</span></div>) : <EmptyState title={query ? 'No matching announcements' : 'No announcements yet'} message={query ? 'Try another search term.' : 'Department announcements will appear here.'} />}
        </section>
      </div>
    </>
  );
}

export function TasksPage({ tasks, query, onViewTask }) {
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const [sortOrder, setSortOrder] = useState('Soonest due');
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'All statuses' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All priorities' || task.priority === priorityFilter;
    const matchesQuery = `${task.title} ${task.description} ${task.owner}`.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesPriority && matchesQuery;
  }).sort((left, right) => sortOrder === 'Soonest due' ? left.dueDate.localeCompare(right.dueDate) : right.dueDate.localeCompare(left.dueDate));

  return (
    <section className="panel">
      <PanelHeading kicker="My work" title="Assigned tasks" />
      <div className="filter-row">
        <label><Filter size={15} aria-hidden="true" /><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option>{TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label><span className="sr-only">Filter by priority</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option>{['High', 'Medium', 'Low'].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
        <label><ArrowDownUp size={15} aria-hidden="true" /><span className="sr-only">Sort by due date</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option>Soonest due</option><option>Latest due</option></select></label>
        <span className="result-count">{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</span>
      </div>
      {filteredTasks.length ? <div className="task-table-wrap"><table className="task-table"><thead><tr><th scope="col">Task</th><th scope="col">Priority</th><th scope="col">Due date</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Task details</span></th></tr></thead>
        <tbody>{filteredTasks.map((task) => <tr key={task.id}>
          <td><button type="button" className="task-title-button" onClick={() => onViewTask(task.id)}>{task.title}</button><small>{task.description}</small><div className="task-progress" aria-label={`${task.progress}% complete`}><span style={{ width: `${task.progress}%` }} /></div></td>
          <td><span className={`pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
          <td><span className={task.dueDate < new Date().toISOString().slice(0, 10) && task.status !== 'Completed' ? 'overdue-date' : ''}>{formatDate(task.dueDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
          <td><span className={`pill task-status-${task.status.toLowerCase().replaceAll(' ', '-')}`}>{task.status}</span></td>
          <td><button type="button" className="secondary-button" onClick={() => onViewTask(task.id)}>Details</button></td>
        </tr>)}</tbody></table></div> : <EmptyState title="No tasks match these filters" message="Try changing your search or clearing a filter." />}
    </section>
  );
}

export function EventsPage({ events, query, onViewEvent }) {
  const visibleEvents = events.filter((event) => `${event.title} ${event.location} ${event.responsibility}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="panel">
      <PanelHeading kicker="Department calendar" title="Events and responsibilities" />
      {visibleEvents.length ? <div className="event-card-list">{visibleEvents.map((event) => <article className="event-card" key={event.id}>
        <div className="event-date-box"><small>{formatDate(event.date, { month: 'short' })}</small><strong>{formatDate(event.date, { day: 'numeric' })}</strong></div>
        <div className="event-card-main"><div className="event-card-title"><h3>{event.title}</h3><span className="pill event-status">{event.status}</span></div><p><CalendarDays size={15} /> {formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })} · {event.time}</p><p>{event.location}</p><p className="event-responsibility"><strong>Your responsibility:</strong> {event.responsibility}</p></div>
        <button type="button" className="secondary-button" onClick={() => onViewEvent(event.id)}>Details</button>
      </article>)}</div> : <EmptyState title="No events found" message="Try another search, or check back when new events are added." />}
    </section>
  );
}

export function AnnouncementsPage({ announcements, query, onCreateAnnouncement }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState('Member newsletter');
  const [error, setError] = useState('');
  const visibleAnnouncements = announcements.filter((item) => `${item.title} ${item.body} ${item.channel} ${item.status}`.toLowerCase().includes(query.toLowerCase()));

  function submit(event) {
    event.preventDefault();
    if (title.trim().length < 5 || body.trim().length < 15) {
      setError('Enter a title of at least 5 characters and message of at least 15 characters.');
      return;
    }
    onCreateAnnouncement({ title: title.trim(), body: body.trim(), channel });
    setTitle('');
    setBody('');
    setChannel('Member newsletter');
    setError('');
    setShowForm(false);
  }

  return (
    <section className="panel">
      <PanelHeading kicker="Marketing workspace" title="Announcements" action={<button type="button" className="primary-button" onClick={() => setShowForm((value) => !value)}><Plus size={16} /> {showForm ? 'Close form' : 'New draft'}</button>} />
      {showForm && <form className="announcement-form" onSubmit={submit} noValidate>
        <h3>Create announcement draft</h3>
        <p>Drafts are saved in this sample workspace only; they are not published to members.</p>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} required /></label>
        <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={600} required /></label>
        <label>Channel<select value={channel} onChange={(event) => setChannel(event.target.value)}><option>Member newsletter</option><option>Campus noticeboard</option><option>Social media</option></select></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button"><Check size={16} /> Save draft</button>
      </form>}
      {visibleAnnouncements.length ? <div className="announcement-list">{visibleAnnouncements.map((item) => <article className="announcement-card" key={item.id}>
        <div className="announcement-card-heading"><div><h3>{item.title}</h3><p>{item.channel} · Updated {formatDate(item.updatedAt)}</p></div><span className={`pill status-pill-${item.status.toLowerCase().replaceAll(' ', '-')}`}>{item.status}</span></div>
        <p className="announcement-body">{item.body}</p>
        {item.status !== 'Published' && <small className="sample-disclaimer">Sample only · publication is not connected to a backend.</small>}
      </article>)}</div> : <EmptyState title="No announcements found" message="Try a different search or start a new draft." />}
    </section>
  );
}

export function MarketingWorkspace({ campaigns, announcements, query, onNavigate }) {
  const search = query.toLowerCase();
  const visibleCampaigns = campaigns.filter((campaign) => `${campaign.title} ${campaign.channel} ${campaign.status}`.toLowerCase().includes(search));
  const visibleAnnouncements = announcements.filter((item) => item.status !== 'Published' && `${item.title} ${item.body} ${item.channel} ${item.status}`.toLowerCase().includes(search));
  return (
    <>
      <section className="panel">
        <PanelHeading kicker="Department workspace" title="Marketing & communications" />
        <p className="section-intro">Campaign planning and announcement drafts for your assigned department. Publishing and reach metrics are sample data and are not connected to a live service.</p>
        {visibleCampaigns.length ? <div className="campaign-grid">{visibleCampaigns.map((campaign) => <article className="campaign-card" key={campaign.id}>
          <div className="campaign-card-top"><Megaphone size={18} /><span className="pill event-status">{campaign.status}</span></div>
          <h3>{campaign.title}</h3><p>{campaign.channel}</p>
          <div className="campaign-meta"><span>Target date</span><strong>{formatDate(campaign.dueDate, { month: 'short', day: 'numeric' })}</strong></div>
          <div className="campaign-meta"><span>Current response</span><strong>{campaign.reach}</strong></div>
        </article>)}</div> : <EmptyState title="No matching campaigns" message="Try another search term." />}
      </section>
      <section className="panel">
        <PanelHeading kicker="Content pipeline" title="Drafts and review" action={<button className="text-button" type="button" onClick={() => onNavigate('announcements')}>Open announcements <ArrowRight size={15} /></button>} />
        {visibleAnnouncements.length ? visibleAnnouncements.map((item) => <div className="announcement-preview" key={item.id}><div><strong>{item.title}</strong><small>{item.channel} · {formatDate(item.updatedAt)}</small></div><span className={`pill status-pill-${item.status.toLowerCase().replaceAll(' ', '-')}`}>{item.status}</span></div>) : <EmptyState title={query ? 'No matching drafts' : 'No drafts waiting'} message={query ? 'Try another search term.' : 'There are no announcements in the content pipeline.'} />}
      </section>
    </>
  );
}

export function TeamPage({ members, query }) {
  const visibleMembers = members.filter((member) => `${member.name} ${member.role}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="panel">
    <PanelHeading kicker="Department directory" title="Team" />
    <p className="section-intro">A read-only view of your department workspace. Role and membership administration stays with authorized administrators.</p>
    {visibleMembers.length ? <div className="team-list">{visibleMembers.map((member) => <article className="team-row" key={member.id}><span className="team-avatar" aria-hidden="true">{member.name.split(' ').map((part) => part[0]).join('')}</span><div><strong>{member.name}</strong><small>{member.role}</small></div><span className="team-assignment-count"><Users size={15} /> {member.assignments} assignments</span></article>)}</div> : <EmptyState title="No team members match" message="Try another search term." />}
  </section>;
}

export function SettingsPage({ preferences, onChange }) {
  return <section className="panel settings-panel">
    <PanelHeading kicker="Workspace preferences" title="Settings" />
    <p className="section-intro">These preferences are local to this sample session and are not saved to an account.</p>
    <label className="preference-row"><span><strong>Email updates</strong><small>Receive department announcement and event updates.</small></span><input type="checkbox" checked={preferences.emailUpdates} onChange={(event) => onChange('emailUpdates', event.target.checked)} /></label>
    <label className="preference-row"><span><strong>Task reminders</strong><small>Show reminders for tasks approaching their due date.</small></span><input type="checkbox" checked={preferences.taskReminders} onChange={(event) => onChange('taskReminders', event.target.checked)} /></label>
  </section>;
}

export function TaskDetailModal({ task, onClose, onUpdateStatus }) {
  const [status, setStatus] = useState(task.status);
  const dialogRef = useDialogAccessibility(onClose);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} tabIndex="-1" className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title">
      <button className="dialog-close" type="button" aria-label="Close task details" onClick={onClose}><X size={19} /></button>
      <p className="panel-kicker">Assigned task</p><h2 id="task-dialog-title">{task.title}</h2>
      <p className="dialog-description">{task.description}</p>
      <div className="dialog-facts"><span><strong>Due</strong>{formatDate(task.dueDate, { month: 'long', day: 'numeric', year: 'numeric' })}</span><span><strong>Priority</strong>{task.priority}</span><span><strong>Assignee</strong>{task.owner}</span><span><strong>Progress</strong>{task.progress}%</span></div>
      <label className="dialog-field">Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{TASK_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="button" className="primary-button" onClick={() => onUpdateStatus(task.id, status)}>Save status</button>{task.status !== 'Completed' && <button type="button" className="complete-button" onClick={() => onUpdateStatus(task.id, 'Completed')}><Check size={16} /> Mark complete</button>}</div>
      <p className="sample-disclaimer">Sample interaction · changes update this page only and are not sent to a backend.</p>
    </section>
  </div>;
}

export function EventDetailModal({ event, onClose }) {
  const dialogRef = useDialogAccessibility(onClose);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(click) => { if (click.target === click.currentTarget) onClose(); }}>
    <section ref={dialogRef} tabIndex="-1" className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
      <button className="dialog-close" type="button" aria-label="Close event details" onClick={onClose}><X size={19} /></button>
      <p className="panel-kicker">Department event</p><h2 id="event-dialog-title">{event.title}</h2>
      <p className="dialog-description">{event.description}</p>
      <div className="dialog-facts"><span><strong>Date and time</strong>{formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })} · {event.time}</span><span><strong>Venue</strong>{event.location}</span><span><strong>Planning status</strong>{event.status}</span><span><strong>Your responsibility</strong>{event.responsibility}</span></div>
      <p className="sample-disclaimer">Event details are sample department data.</p>
      <div className="dialog-actions"><button type="button" className="primary-button" onClick={onClose}>Done</button></div>
    </section>
  </div>;
}
