import { v4 as uuidv4 } from 'uuid';
import { notificationRepository } from '../repositories/notification.repository';
import { Notification, NotificationType, NotificationSeverity } from '../models/notification.model';

interface NotificationPayload {
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  recipientId: string;
  recipientRole?: string;
  actionLink?: string;
  resourceType?: string;
  resourceId?: string;
}

class NotificationEngine {
  async send(payload: NotificationPayload): Promise<Notification> {
    const notification: Notification = {
      id: `NOTIF-${uuidv4().substring(0, 8).toUpperCase()}`,
      ...payload,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await notificationRepository.create(notification);
    return notification;
  }

  async sendToMany(recipientIds: string[], payload: Omit<NotificationPayload, 'recipientId'>): Promise<Notification[]> {
    const results: Notification[] = [];
    for (const recipientId of recipientIds) {
      const n = await this.send({ ...payload, recipientId });
      results.push(n);
    }
    return results;
  }

  // Event-driven triggers
  async onPolicyIssued(policyId: string, recipientId: string) {
    return this.send({
      type: 'POLICY_ISSUED',
      severity: 'success',
      title: 'Policy Issued',
      message: `Policy ${policyId} has been issued successfully.`,
      recipientId,
      actionLink: `/policies/${policyId}`,
      resourceType: 'Policy',
      resourceId: policyId,
    });
  }

  async onClaimFiled(claimId: string, policyId: string, recipientIds: string[]) {
    return this.sendToMany(recipientIds, {
      type: 'CLAIM_FILED',
      severity: 'warning',
      title: 'New Claim Filed',
      message: `A new claim ${claimId} has been filed for policy ${policyId}.`,
      actionLink: `/claims/${claimId}`,
      resourceType: 'Claim',
      resourceId: claimId,
    });
  }

  async onClaimStatusChanged(claimId: string, newStatus: string, recipientId: string) {
    const severity: NotificationSeverity =
      newStatus === 'Approved' ? 'success' :
      newStatus === 'Rejected' ? 'error' :
      newStatus === 'Settled' ? 'success' : 'info';

    return this.send({
      type: newStatus === 'Approved' ? 'CLAIM_APPROVED' : newStatus === 'Rejected' ? 'CLAIM_REJECTED' : newStatus === 'Settled' ? 'CLAIM_SETTLED' : 'SYSTEM',
      severity,
      title: `Claim ${newStatus}`,
      message: `Claim ${claimId} has been moved to ${newStatus}.`,
      recipientId,
      actionLink: `/claims/${claimId}`,
      resourceType: 'Claim',
      resourceId: claimId,
    });
  }

  async onUWReferral(policyId: string, recipientId: string) {
    return this.send({
      type: 'UW_REFERRAL',
      severity: 'warning',
      title: 'Underwriting Referral',
      message: `Policy ${policyId} requires underwriting review.`,
      recipientId,
      actionLink: `/underwriting`,
      resourceType: 'Policy',
      resourceId: policyId,
    });
  }

  async onRenewalDue(policyId: string, recipientId: string, daysUntilExpiry: number) {
    return this.send({
      type: 'RENEWAL_DUE',
      severity: daysUntilExpiry <= 7 ? 'error' : 'warning',
      title: 'Renewal Due',
      message: `Policy ${policyId} expires in ${daysUntilExpiry} days. Renewal action required.`,
      recipientId,
      actionLink: `/policies/${policyId}`,
      resourceType: 'Policy',
      resourceId: policyId,
    });
  }

  async onTaskAssigned(taskId: string, taskTitle: string, recipientId: string) {
    return this.send({
      type: 'TASK_ASSIGNED',
      severity: 'info',
      title: 'Task Assigned',
      message: `You have been assigned: "${taskTitle}"`,
      recipientId,
      actionLink: `/tasks`,
      resourceType: 'Task',
      resourceId: taskId,
    });
  }

  async onTaskOverdue(taskId: string, taskTitle: string, recipientId: string) {
    return this.send({
      type: 'TASK_OVERDUE',
      severity: 'error',
      title: 'Task Overdue',
      message: `Task "${taskTitle}" is past its due date.`,
      recipientId,
      actionLink: `/tasks`,
      resourceType: 'Task',
      resourceId: taskId,
    });
  }

  async onFNOLSubmitted(fnolId: string, recipientIds: string[]) {
    return this.sendToMany(recipientIds, {
      type: 'FNOL_SUBMITTED',
      severity: 'warning',
      title: 'New FNOL Submitted',
      message: `First Notice of Loss ${fnolId} has been submitted and needs processing.`,
      actionLink: `/claims/fnol`,
      resourceType: 'FNOL',
      resourceId: fnolId,
    });
  }

  async onReserveChanged(claimId: string, recipientId: string, newAmount: number) {
    return this.send({
      type: 'RESERVE_CHANGED',
      severity: 'info',
      title: 'Reserve Updated',
      message: `Reserve for claim ${claimId} has been updated to ₹${newAmount.toLocaleString()}.`,
      recipientId,
      actionLink: `/claims/${claimId}`,
      resourceType: 'Claim',
      resourceId: claimId,
    });
  }
}

export const notificationEngine = new NotificationEngine();
