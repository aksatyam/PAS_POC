import { v4 as uuidv4 } from 'uuid';
import { taskRepository } from '../repositories/task.repository';
import { Task, TaskType, TaskPriority } from '../models/notification.model';
import { notificationEngine } from './notificationEngine';

interface CreateTaskPayload {
  type: TaskType;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName?: string;
  priority: TaskPriority;
  dueDate: string;
  slaDeadline?: string;
  resourceType?: string;
  resourceId?: string;
  actionLink?: string;
  createdBy: string;
}

class TaskEngine {
  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const task: Task = {
      id: `TASK-${uuidv4().substring(0, 8).toUpperCase()}`,
      ...payload,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await taskRepository.create(task);

    // Send notification to assignee
    await notificationEngine.onTaskAssigned(task.id, task.title, task.assigneeId);

    return task;
  }

  async updateStatus(taskId: string, status: Task['status'], userId: string): Promise<Task | undefined> {
    const updates: Partial<Task> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'Completed') {
      updates.completedAt = new Date().toISOString();
    }
    return taskRepository.update(taskId, updates);
  }

  async reassign(taskId: string, newAssigneeId: string, assigneeName: string): Promise<Task | undefined> {
    const task = await taskRepository.update(taskId, {
      assigneeId: newAssigneeId,
      assigneeName,
      updatedAt: new Date().toISOString(),
    });
    if (task) {
      await notificationEngine.onTaskAssigned(task.id, task.title, newAssigneeId);
    }
    return task;
  }

  // Workflow triggers
  async onClaimFiled(claimId: string, assigneeId: string, createdBy: string) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    return this.createTask({
      type: 'CLAIM_REVIEW',
      title: `Review claim ${claimId}`,
      description: `New claim ${claimId} has been filed and needs initial review.`,
      assigneeId,
      priority: 'High',
      dueDate: dueDate.toISOString(),
      slaDeadline: dueDate.toISOString(),
      resourceType: 'Claim',
      resourceId: claimId,
      actionLink: `/claims/${claimId}`,
      createdBy,
    });
  }

  async onFNOLSubmitted(fnolId: string, assigneeId: string, createdBy: string) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    return this.createTask({
      type: 'FNOL_PROCESSING',
      title: `Process FNOL ${fnolId}`,
      description: `First Notice of Loss ${fnolId} submitted. Review and create claim if valid.`,
      assigneeId,
      priority: 'Urgent',
      dueDate: dueDate.toISOString(),
      slaDeadline: dueDate.toISOString(),
      resourceType: 'FNOL',
      resourceId: fnolId,
      actionLink: `/claims/fnol`,
      createdBy,
    });
  }

  async onUWReferral(policyId: string, assigneeId: string, createdBy: string) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    return this.createTask({
      type: 'UW_REFERRAL',
      title: `Underwriting review for ${policyId}`,
      description: `Policy ${policyId} has been referred for senior underwriting review.`,
      assigneeId,
      priority: 'High',
      dueDate: dueDate.toISOString(),
      resourceType: 'Policy',
      resourceId: policyId,
      actionLink: `/underwriting`,
      createdBy,
    });
  }

  async onPolicyRenewalDue(policyId: string, assigneeId: string, expiryDate: string) {
    const dueDate = new Date(expiryDate);
    dueDate.setDate(dueDate.getDate() - 7);
    return this.createTask({
      type: 'POLICY_RENEWAL',
      title: `Renew policy ${policyId}`,
      description: `Policy ${policyId} is expiring on ${expiryDate}. Process renewal.`,
      assigneeId,
      priority: 'Medium',
      dueDate: dueDate.toISOString(),
      resourceType: 'Policy',
      resourceId: policyId,
      actionLink: `/policies/${policyId}`,
      createdBy: 'system',
    });
  }

  async onFraudReview(claimId: string, fraudScore: number, assigneeId: string, createdBy: string) {
    const priority: TaskPriority = fraudScore >= 70 ? 'Urgent' : fraudScore >= 50 ? 'High' : 'Medium';
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (priority === 'Urgent' ? 1 : 2));
    return this.createTask({
      type: 'FRAUD_REVIEW',
      title: `Fraud review for claim ${claimId}`,
      description: `Claim ${claimId} has fraud score of ${fraudScore}%. Requires investigation.`,
      assigneeId,
      priority,
      dueDate: dueDate.toISOString(),
      resourceType: 'Claim',
      resourceId: claimId,
      actionLink: `/claims/${claimId}`,
      createdBy,
    });
  }

  // Check and mark overdue tasks
  async checkOverdueTasks(): Promise<Task[]> {
    const overdue = taskRepository.findOverdue();
    const results: Task[] = [];
    for (const task of overdue) {
      if (task.status !== 'Overdue') {
        const updated = await taskRepository.update(task.id, {
          status: 'Overdue',
          updatedAt: new Date().toISOString(),
        });
        if (updated) {
          await notificationEngine.onTaskOverdue(task.id, task.title, task.assigneeId);
          results.push(updated);
        }
      }
    }
    return results;
  }
}

export const taskEngine = new TaskEngine();
