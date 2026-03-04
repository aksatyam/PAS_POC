import { BaseRepository } from './base.repository';
import { Task, TaskStatus, TaskPriority } from '../models/notification.model';

class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('tasks.json');
  }

  findByAssignee(assigneeId: string): Task[] {
    return this.findByFilter((t) => t.assigneeId === assigneeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findByStatus(status: TaskStatus): Task[] {
    return this.findByFilter((t) => t.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findByPriority(priority: TaskPriority): Task[] {
    return this.findByFilter((t) => t.priority === priority);
  }

  findOverdue(): Task[] {
    const now = new Date();
    return this.findByFilter(
      (t) => t.status !== 'Completed' && t.status !== 'Cancelled' && new Date(t.dueDate) < now
    );
  }

  findByResource(resourceType: string, resourceId: string): Task[] {
    return this.findByFilter((t) => t.resourceType === resourceType && t.resourceId === resourceId);
  }

  getDashboard(assigneeId: string) {
    const myTasks = this.findByAssignee(assigneeId);
    const now = new Date();
    const open = myTasks.filter((t) => t.status === 'Open').length;
    const inProgress = myTasks.filter((t) => t.status === 'In Progress').length;
    const overdue = myTasks.filter(
      (t) => t.status !== 'Completed' && t.status !== 'Cancelled' && new Date(t.dueDate) < now
    ).length;
    const completedThisWeek = myTasks.filter((t) => {
      if (t.status !== 'Completed' || !t.completedAt) return false;
      const completed = new Date(t.completedAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return completed >= weekAgo;
    }).length;

    const byPriority = {
      Urgent: myTasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed' && t.status !== 'Cancelled').length,
      High: myTasks.filter((t) => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Cancelled').length,
      Medium: myTasks.filter((t) => t.priority === 'Medium' && t.status !== 'Completed' && t.status !== 'Cancelled').length,
      Low: myTasks.filter((t) => t.priority === 'Low' && t.status !== 'Completed' && t.status !== 'Cancelled').length,
    };

    return { total: myTasks.length, open, inProgress, overdue, completedThisWeek, byPriority };
  }
}

export const taskRepository = new TaskRepository();
