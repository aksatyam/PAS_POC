export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'TOKEN_REFRESH' | 'EVALUATE' | 'OVERRIDE' | 'SETTLEMENT' | 'QUOTE' | 'BIND' | 'ISSUE' | 'ENDORSE' | 'RENEW' | 'REINSTATE' | 'VOID' | 'PAYMENT' | 'DEACTIVATE' | 'BULK' | 'RESOLVE' | 'ESCALATE';

export interface AuditLog {
  id: string;
  actor: {
    userId: string;
    role: string;
  };
  action: AuditAction;
  resource: {
    type: string;
    id: string;
  };
  before?: Record<string, any>;
  after?: Record<string, any>;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
