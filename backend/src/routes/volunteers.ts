import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

// Get Volunteer Tasks
router.get('/', (_req: Request, res: Response) => {
  return res.json({ tasks: store.db.volunteerTasks });
});

// Create Volunteer Task
router.post('/', (req: Request, res: Response) => {
  const { title, department, assignee, priority, dueDate, notes } = req.body;

  if (!title || !department) {
    return res.status(400).json({ error: 'Title and department are required.' });
  }

  const newTask = {
    id: `tsk-${Date.now()}`,
    title,
    department,
    assignee: assignee || 'Unassigned',
    status: 'Pending',
    priority: priority || 'Medium',
    dueDate: dueDate || new Date().toISOString().slice(0, 10),
    notes: notes || '',
    progress: 0,
  };

  store.db.volunteerTasks.unshift(newTask);
  store.commit();

  return res.status(201).json({ task: newTask, message: 'Volunteer task created.' });
});

// Update Task Status
router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, progress } = req.body;

  const taskIndex = store.db.volunteerTasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  if (status) store.db.volunteerTasks[taskIndex].status = status;
  if (progress !== undefined) store.db.volunteerTasks[taskIndex].progress = Number(progress);
  if (status === 'Completed') store.db.volunteerTasks[taskIndex].progress = 100;

  store.commit();

  return res.json({ task: store.db.volunteerTasks[taskIndex], message: 'Task status updated.' });
});

export { router as volunteersRouter };
