function TaskCard({ text }) {
  return <div className="kanban-card">{text}</div>;
}

function TaskBoard({ board }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Workflow</p>
          <h3>Task board</h3>
        </div>
      </div>

      <div className="kanban-board">
        {board.columns.map((column) => (
          <div key={column.id} className="kanban-column">
            <div className="kanban-column__header">
              <strong>{column.title}</strong>
              <span>{column.cards.length}</span>
            </div>
            <div className="kanban-column__list">
              {column.cards.map((text) => (
                <TaskCard key={text} text={text} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TaskBoard;
