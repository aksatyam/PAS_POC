import { Request, Response } from 'express';
import { taskRepository } from '../repositories/task.repository';
import { taskEngine } from '../services/taskEngine';
import { TaskStatus, TaskPriority } from '../models/notification.model';

export class TaskController {
  /** GET /tasks */
  static list(req: Request, res: Response) {
    const { assignee, status, priority, page = '1', limit = '20' } = req.query;

    let tasks = taskRepository.findAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (assignee) tasks = tasks.filter((t) => t.assigneeId === assignee);
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);

    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);
    const { data, total } = taskRepository.paginate(tasks, p, l);

    res.json({
      success: true,
      data,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  }

  /** GET /tasks/my */
  static myTasks(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const tasks = taskRepository.findByAssignee(userId);
    const activeTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
    res.json({ success: true, data: activeTasks });
  }

  /** GET /tasks/dashboard */
  static dashboard(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const summary = taskRepository.getDashboard(userId);
    res.json({ success: true, data: summary });
  }

  /** GET /tasks/:id */
  static getById(req: Request, res: Response) {
    const task = taskRepository.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  }

  /** POST /tasks */
  static async create(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const { type, title, description, assigneeId, assigneeName, priority, dueDate, slaDeadline, resourceType, resourceId, actionLink } = req.body;

    if (!title || !assigneeId || !priority || !dueDate) {
      return res.status(400).json({ success: false, message: 'title, assigneeId, priority, and dueDate are required' });
    }

    const task = await taskEngine.createTask({
      type: type || 'GENERAL',
      title,
      description: description || '',
      assigneeId,
      assigneeName,
      priority,
      dueDate,
      slaDeadline,
      resourceType,
      resourceId,
      actionLink,
      createdBy: userId,
    });

    res.status(201).json({ success: true, data: task });
  }

  /** PUT /tasks/:id */
  static async update(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const task = taskRepository.findById(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { status, assigneeId, assigneeName, priority } = req.body;

    if (status) {
      const updated = await taskEngine.updateStatus(id, status as TaskStatus, userId);
      if (!updated) return res.status(400).json({ success: false, message: 'Update failed' });
    }

    if (assigneeId) {
      await taskEngine.reassign(id, assigneeId, assigneeName || assigneeId);
    }

    if (priority) {
      await taskRepository.update(id, { priority: priority as TaskPriority, updatedAt: new Date().toISOString() });
    }

    const updated = taskRepository.findById(id);
    res.json({ success: true, data: updated });
  }

  /** DELETE /tasks/:id */
  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    const task = taskRepository.findById(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await taskRepository.update(id, { status: 'Cancelled', updatedAt: new Date().toISOString() });
    res.json({ success: true, message: 'Task cancelled' });
  }

  /** POST /tasks/check-overdue */
  static async checkOverdue(_req: Request, res: Response) {
    const overdue = await taskEngine.checkOverdueTasks();
    res.json({ success: true, data: { markedOverdue: overdue.length } });
  }
}
