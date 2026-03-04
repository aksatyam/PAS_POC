export type DocumentType =
  | 'Identity Proof'
  | 'Property Document'
  | 'Income Proof'
  | 'Claim Form'
  | 'Settlement Letter'
  | 'Application Form'
  | 'Address Proof'
  | 'Property Valuation Report'
  | 'Credit Report'
  | 'Insurance Certificate'
  | 'NOC Document'
  | 'Sanction Letter'
  | 'Agreement Copy'
  | 'Damage Assessment'
  | 'Police Report'
  | 'Medical Report'
  | 'Policy Declaration'
  | 'Certificate of Insurance'
  | 'Endorsement Schedule'
  | 'Renewal Notice'
  | 'Claims Correspondence'
  | 'Billing Invoice'
  | 'Other';

export type DocumentCategory = 'Policy' | 'Claims' | 'Underwriting' | 'Correspondence' | 'Billing' | 'General';

export interface PolicyDocument {
  id: string;
  policyId: string;
  claimId?: string;
  type: DocumentType;
  category: DocumentCategory;
  filename: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  version: number;
  parentDocumentId?: string; // for version tracking
  generatedFrom?: string; // template ID if generated
  metadata: Record<string, any>;
}

export type TemplateType =
  | 'POLICY_DECLARATION'
  | 'CERTIFICATE_OF_INSURANCE'
  | 'ENDORSEMENT_SCHEDULE'
  | 'RENEWAL_NOTICE'
  | 'CLAIMS_ACKNOWLEDGEMENT'
  | 'SETTLEMENT_OFFER'
  | 'BILLING_INVOICE'
  | 'CANCELLATION_NOTICE';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  category: DocumentCategory;
  fields: string[]; // merge fields
  createdAt: string;
}
