export type NotificationType =
  | 'POLICY_ISSUED' | 'POLICY_RENEWED' | 'POLICY_ENDORSED' | 'POLICY_CANCELLED' | 'POLICY_LAPSED'
  | 'CLAIM_FILED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'CLAIM_SETTLED' | 'FNOL_SUBMITTED'
  | 'UW_REFERRAL' | 'UW_DECISION'
  | 'TASK_ASSIGNED' | 'TASK_OVERDUE' | 'TASK_COMPLETED'
  | 'RESERVE_CHANGED' | 'RENEWAL_DUE' | 'PAYMENT_DUE' | 'PAYMENT_OVERDUE'
  | 'SYSTEM';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  recipientId: string;
  recipientRole?: string;
  actionLink?: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

export type TaskType =
  | 'CLAIM_REVIEW' | 'CLAIM_INVESTIGATION' | 'CLAIM_SETTLEMENT'
  | 'UW_REVIEW' | 'UW_REFERRAL'
  | 'POLICY_RENEWAL' | 'POLICY_ENDORSEMENT'
  | 'DOCUMENT_REVIEW' | 'FNOL_PROCESSING'
  | 'RESERVE_REVIEW' | 'FRAUD_REVIEW'
  | 'GENERAL';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  slaDeadline?: string;
  resourceType?: string;
  resourceId?: string;
  actionLink?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}
