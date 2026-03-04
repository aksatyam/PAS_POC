export type ActivityAction =
  | 'POLICY_CREATED' | 'POLICY_UPDATED' | 'POLICY_ISSUED' | 'POLICY_CANCELLED' | 'POLICY_ENDORSED' | 'POLICY_RENEWED'
  | 'CLAIM_FILED' | 'CLAIM_UPDATED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'CLAIM_SETTLED'
  | 'UW_EVALUATED' | 'UW_OVERRIDDEN' | 'REFERRAL_CREATED' | 'REFERRAL_RESOLVED'
  | 'PAYMENT_RECORDED' | 'INVOICE_GENERATED'
  | 'TASK_ASSIGNED' | 'TASK_COMPLETED'
  | 'DOCUMENT_UPLOADED' | 'DOCUMENT_GENERATED'
  | 'USER_LOGIN' | 'USER_LOGOUT';

export type EntityType = 'policy' | 'claim' | 'underwriting' | 'billing' | 'task' | 'document' | 'user';

export interface ActivityEntry {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  actor: { userId: string; userName: string };
  summary: string;
  details?: Record<string, any>;
  timestamp: string;
}
