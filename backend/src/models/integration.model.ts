export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdBy: string;
  isActive: boolean;
  rateLimit: number; // requests per minute
  lastUsedAt?: string;
  usageCount: number;
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
}

export type WebhookEvent =
  | 'policy.created' | 'policy.updated' | 'policy.cancelled'
  | 'claim.filed' | 'claim.updated' | 'claim.settled'
  | 'underwriting.evaluated' | 'underwriting.overridden'
  | 'payment.recorded' | 'invoice.generated';

export type WebhookStatus = 'Active' | 'Inactive' | 'Failed';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  secret: string;
  retryCount: number;
  maxRetries: number;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: number;
  failureCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  responseStatus?: number;
  responseBody?: string;
  success: boolean;
  attemptNumber: number;
  deliveredAt: string;
}
