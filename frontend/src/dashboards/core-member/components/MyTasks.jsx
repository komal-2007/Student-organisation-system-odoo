function MyTasks({ tasks }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">My tasks</p>
          <h3>Priority list</h3>
        </div>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-row">
            <div className="task-main">
              <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
              <div>
                <strong>{task.title}</strong>
                <small>{task.owner}</small>
              </div>
            </div>
            <div className="task-meta">
              <span>{task.due}</span>
              <span className="task-stage">{task.stage}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MyTasks;
