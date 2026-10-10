import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, CheckSquare, ChevronRight, ClipboardList, LayoutDashboard, Menu, Megaphone, Search, Settings, ShieldCheck, Users, X } from 'lucide-react';
import './CoreMemberDashboard.css';

import {
  AnnouncementsPage,
  EventsPage,
  EventDetailModal,
  MarketingWorkspace,
  OverviewPage,
  SettingsPage,
  TaskDetailModal,
  TasksPage,
  TeamPage,
} from './components/CoreMemberPages';
import data from './data/coreMemberMockData';
import { useAuth } from '../../services/auth/AuthContext';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'My tasks', icon: ClipboardList },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'workspace', label: 'Marketing workspace', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const pageTitles = Object.fromEntries(navigation.map(({ id, label }) => [id, label]));

function CoreMemberDashboard() {
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState('overview');
  const [tasks, setTasks] = useState(data.tasks);
  const [announcements, setAnnouncements] = useState(data.announcements);
  const [activity, setActivity] = useState(data.activityItems);
  const [preferences, setPreferences] = useState(data.preferences);
  const [query, setQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState('');

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const selectedEvent = data.upcomingEvents.find((event) => event.id === selectedEventId);
  const attentionCount = tasks.filter((task) => task.status !== 'Completed' && task.dueDate <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)).length;

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const page = useMemo(() => {
    switch (activePage) {
      case 'tasks':
        return <TasksPage tasks={tasks} query={query} onViewTask={setSelectedTaskId} />;
      case 'events':
        return <EventsPage events={data.upcomingEvents} query={query} onViewEvent={setSelectedEventId} />;
      case 'announcements':
        return <AnnouncementsPage announcements={announcements} query={query} onCreateAnnouncement={createAnnouncement} />;
      case 'workspace':
        return <MarketingWorkspace campaigns={data.campaigns} announcements={announcements} query={query} onNavigate={navigateTo} />;
      case 'team':
        return <TeamPage members={data.teamMembers} query={query} />;
      case 'settings':
        return <SettingsPage preferences={preferences} onChange={updatePreference} />;
      default:
        return <OverviewPage
          summary={data.departmentSummary}
          tasks={tasks}
          events={data.upcomingEvents}
          activity={activity}
          announcements={announcements}
          participation={data.participationByMonth}
          query={query}
          onViewTask={setSelectedTaskId}
          onViewEvent={setSelectedEventId}
          onNavigate={navigateTo}
        />;
    }
  }, [activePage, tasks, query, announcements, activity, preferences]);

  function navigateTo(pageId) {
    setActivePage(pageId);
    setMobileNavOpen(false);
    setNotificationsOpen(false);
    setQuery('');
  }

  function addActivity(message, type) {
    setActivity((items) => [{ id: `activity-${Date.now()}`, message, time: 'Just now', type }, ...items]);
  }

  function updateTaskStatus(taskId, status) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) {
      setToast('That task is no longer available.');
      setSelectedTaskId(null);
      return;
    }
    setTasks((items) => items.map((task) => task.id === taskId ? {
      ...task,
      status,
      progress: status === 'Completed' ? 100 : status === 'To do' ? 0 : status === 'Review' ? Math.max(task.progress, 75) : Math.max(task.progress, 15),
    } : task));
    addActivity(`${currentTask.title} moved to ${status.toLowerCase()}.`, 'task');
    setSelectedTaskId(null);
    setToast(status === 'Completed' ? 'Task marked complete.' : 'Task status updated.');
  }

  function createAnnouncement(announcement) {
    const today = new Date().toISOString().slice(0, 10);
    setAnnouncements((items) => [{
      id: `announcement-${Date.now()}`,
      ...announcement,
      status: 'Draft',
      updatedAt: today,
    }, ...items]);
    addActivity(`Announcement draft created: ${announcement.title}.`, 'announcement');
    setToast('Announcement draft saved in this sample workspace.');
  }

  function updatePreference(key, value) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setToast('Preference updated for this session.');
  }

  function navigateFromNotice() {
    navigateTo('tasks');
  }

  return (
    <div className="core-member-shell">
      {mobileNavOpen && <button type="button" className="mobile-nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`core-member-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">S</span>
          <div><span className="brand-label">Skyline</span><strong>Department workspace</strong></div>
          <button type="button" className="mobile-nav-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={19} /></button>
        </div>
        <nav className="sidebar-nav" aria-label="Department navigation">
          <span className="nav-section-label">Workspace</span>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={`sidebar-link ${id === activePage ? 'active' : ''}`} aria-current={id === activePage ? 'page' : undefined} onClick={() => navigateTo(id)}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-card"><ShieldCheck size={18} aria-hidden="true" /><div><strong>{data.profile.role}</strong><span>{data.profile.department}</span></div></div>
        <p className="sidebar-data-note">Sample workspace · not connected to a live account</p>
      </aside>

      <div className="core-member-main">
        <header className="core-member-topbar">
          <div className="topbar-title">
            <button type="button" className="mobile-menu-button" aria-label="Open navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
            <div><p className="topbar-kicker">{data.profile.department}</p><h1>{pageTitles[activePage]}</h1></div>
          </div>
          <div className="topbar-actions">
            {activePage !== 'settings' && <label className="global-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search current section</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this section" />
              {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}
            </label>}
            <div className="notification-wrap">
              <button type="button" className={`icon-button ${notificationsOpen ? 'is-active' : ''}`} aria-label={`Notifications, ${attentionCount} items need attention`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
                <Bell size={18} aria-hidden="true" />{attentionCount > 0 && <span className="notification-count">{attentionCount}</span>}
              </button>
              {notificationsOpen && <div className="notification-popover"><strong>Needs attention</strong>{attentionCount ? tasks.filter((task) => task.status !== 'Completed' && task.dueDate <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)).slice(0, 4).map((task) => <button key={task.id} type="button" onClick={() => { setSelectedTaskId(task.id); setNotificationsOpen(false); }}><span>{task.title}</span><small>{task.dueDate < new Date().toISOString().slice(0, 10) ? 'Overdue' : `Due ${task.dueDate}`}</small></button>) : <p>No urgent tasks. You’re all caught up.</p>}<button className="notification-footer" type="button" onClick={navigateFromNotice}>Review tasks <ChevronRight size={15} /></button></div>}
            </div>
            <div className="profile-chip" aria-label={`${data.profile.name}, ${data.profile.role}`} style={{ position: 'relative' }}>
              <button
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
              >
                <span className="profile-avatar" aria-hidden="true">MC</span>
                <span className="profile-name">{data.profile.name}<small>{data.profile.role}</small></span>
              </button>
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 220,
                  background: '#fff', border: '1px solid #E2E6F0', borderRadius: 12,
                  boxShadow: '0 12px 24px -4px rgba(16, 20, 38, 0.12)', zIndex: 100, padding: 8
                }}>
                  <button
                    type="button"
                    style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, color: '#101426' }}
                    onMouseDown={(e) => { e.stopPropagation(); alert('My Profile (Mock)'); setProfileOpen(false); }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F4F5FB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, color: '#101426' }}
                    onMouseDown={(e) => { e.stopPropagation(); navigateTo('settings'); setProfileOpen(false); }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F4F5FB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, color: '#D92D20' }}
                    onMouseDown={async (e) => {
                      e.stopPropagation();
                      setProfileOpen(false);
                      await logout();
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F4F5FB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="main-content" className="core-member-content">{page}</main>
      </div>

      {selectedTask && <TaskDetailModal key={selectedTask.id} task={selectedTask} onClose={() => setSelectedTaskId(null)} onUpdateStatus={updateTaskStatus} />}
      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEventId(null)} />}
      {toast && <div className="toast-message" role="status"><CheckSquare size={17} aria-hidden="true" />{toast}</div>}
    </div>
  );
}

export default CoreMemberDashboard;
