import { TemplateType, DocumentTemplate, PolicyDocument, DocumentCategory } from '../models';
import { templateRepository } from '../repositories/template.repository';
import { documentRepository } from '../repositories/document.repository';
import { generateId } from '../utils/id-generator';

interface GenerateOptions {
  templateId: string;
  mergeData: Record<string, any>;
  policyId?: string;
  claimId?: string;
  userId: string;
}

interface GeneratedDocument {
  document: PolicyDocument;
  content: string; // HTML content that would be converted to PDF
}

const TEMPLATE_RENDERERS: Record<TemplateType, (data: Record<string, any>) => string> = {
  POLICY_DECLARATION: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #E67E22; margin: 5px 0;">Policy Declaration Page</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 8px; font-weight: bold; width: 200px;">Policy Number:</td><td style="padding: 8px;">${data.policyNumber || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Insured Name:</td><td style="padding: 8px;">${data.insuredName || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Policy Type:</td><td style="padding: 8px;">${data.policyType || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Effective Date:</td><td style="padding: 8px;">${data.effectiveDate || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Expiry Date:</td><td style="padding: 8px;">${data.expiryDate || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Coverage Amount:</td><td style="padding: 8px;">${data.coverageAmount || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Annual Premium:</td><td style="padding: 8px;">${data.premium || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Property Address:</td><td style="padding: 8px;">${data.propertyAddress || 'N/A'}</td></tr>
      </table>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p>This declaration page is a summary of coverage. Please refer to the complete policy for full terms and conditions.</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>`,

  CERTIFICATE_OF_INSURANCE: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #27ae60; margin: 5px 0;">Certificate of Insurance</h2>
      </div>
      <p style="text-align: center; font-size: 14px; color: #374151;">This certifies that the following insurance coverage is in effect:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb;">
        <tr style="background: #1a365d; color: white;"><th style="padding: 10px; text-align: left;" colspan="2">Coverage Details</th></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Policy Number:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.policyNumber || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Named Insured:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.insuredName || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Coverage Type:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.policyType || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Coverage Amount:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.coverageAmount || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Effective:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.effectiveDate || 'N/A'} to ${data.expiryDate || 'N/A'}</td></tr>
      </table>
      <div style="margin-top: 40px; font-size: 12px; color: #6b7280;">
        <p>This certificate is issued as a matter of information only and confers no rights upon the certificate holder.</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>`,

  ENDORSEMENT_SCHEDULE: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #2196F3; margin: 5px 0;">Endorsement Schedule</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 8px; font-weight: bold;">Policy Number:</td><td style="padding: 8px;">${data.policyNumber || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Endorsement ID:</td><td style="padding: 8px;">${data.endorsementId || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Effective Date:</td><td style="padding: 8px;">${data.effectiveDate || 'N/A'}</td></tr>
      </table>
      <h3 style="color: #1a365d;">Changes</h3>
      <p>${data.changeDescription || 'No description provided'}</p>
      <table style="width: 100%; margin-top: 20px; border: 1px solid #e5e7eb;">
        <tr style="background: #f3f4f6;"><td style="padding: 8px; font-weight: bold;">Premium Adjustment:</td><td style="padding: 8px;">${data.premiumDelta || '$0'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">New Annual Premium:</td><td style="padding: 8px;">${data.newPremium || 'N/A'}</td></tr>
      </table>
      <div style="margin-top: 40px; font-size: 12px; color: #6b7280;"><p>Generated on: ${new Date().toLocaleDateString()}</p></div>
    </div>`,

  RENEWAL_NOTICE: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #f39c12; margin: 5px 0;">Renewal Notice</h2>
      </div>
      <p>Dear ${data.insuredName || 'Policyholder'},</p>
      <p>Your policy <strong>${data.policyNumber || ''}</strong> is due for renewal on <strong>${data.expiryDate || 'N/A'}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb;">
        <tr style="background: #1a365d; color: white;"><th style="padding: 10px;" colspan="2">Renewal Terms</th></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Coverage Amount:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.coverageAmount || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Renewal Premium:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.renewalPremium || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e5e7eb;">Renewal Deadline:</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.renewalDeadline || 'N/A'}</td></tr>
      </table>
      <p>Please contact us to renew your coverage before the deadline.</p>
      <div style="margin-top: 40px; font-size: 12px; color: #6b7280;"><p>Generated on: ${new Date().toLocaleDateString()}</p></div>
    </div>`,

  CLAIMS_ACKNOWLEDGEMENT: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #e74c3c; margin: 5px 0;">Claims Acknowledgement</h2>
      </div>
      <p>Dear ${data.insuredName || 'Policyholder'},</p>
      <p>We acknowledge receipt of your claim. Your claim details are as follows:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: bold;">Claim Number:</td><td style="padding: 8px;">${data.claimId || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Policy Number:</td><td style="padding: 8px;">${data.policyNumber || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Date of Loss:</td><td style="padding: 8px;">${data.dateOfLoss || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Claim Type:</td><td style="padding: 8px;">${data.claimType || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Filed Date:</td><td style="padding: 8px;">${data.filedDate || 'N/A'}</td></tr>
      </table>
      <p>We will review your claim and contact you within 5 business days.</p>
      <div style="margin-top: 40px; font-size: 12px; color: #6b7280;"><p>Generated on: ${new Date().toLocaleDateString()}</p></div>
    </div>`,

  SETTLEMENT_OFFER: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #27ae60; margin: 5px 0;">Settlement Offer</h2>
      </div>
      <p>Dear ${data.insuredName || 'Policyholder'},</p>
      <p>Re: Claim ${data.claimId || ''} on Policy ${data.policyNumber || ''}</p>
      <p>Following our review, we are pleased to offer a settlement as follows:</p>
      <table style="width: 100%; border: 2px solid #27ae60; margin: 20px 0;">
        <tr style="background: #27ae60; color: white;"><th style="padding: 12px;" colspan="2">Settlement Details</th></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e5e7eb;">Settlement Amount:</td><td style="padding: 10px; font-size: 18px; font-weight: bold; color: #27ae60; border: 1px solid #e5e7eb;">${data.settlementAmount || 'N/A'}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e5e7eb;">Claim Description:</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${data.claimDescription || 'N/A'}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #e5e7eb;">Approved Date:</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${data.approvedDate || 'N/A'}</td></tr>
      </table>
      <div style="margin-top: 40px; font-size: 12px; color: #6b7280;"><p>Generated on: ${new Date().toLocaleDateString()}</p></div>
    </div>`,

  BILLING_INVOICE: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #1a365d; margin: 5px 0;">Invoice</h2>
      </div>
      <table style="width: 100%; margin-bottom: 20px;">
        <tr><td style="padding: 4px;"><strong>Invoice No:</strong> ${data.invoiceNumber || 'N/A'}</td><td style="padding: 4px; text-align: right;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</td></tr>
        <tr><td style="padding: 4px;"><strong>Policy:</strong> ${data.policyNumber || 'N/A'}</td><td style="padding: 4px; text-align: right;"><strong>Due Date:</strong> ${data.dueDate || 'N/A'}</td></tr>
        <tr><td style="padding: 4px;"><strong>Bill To:</strong> ${data.insuredName || 'N/A'}</td><td></td></tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
        <tr style="background: #1a365d; color: white;"><th style="padding: 10px; text-align: left;">Description</th><th style="padding: 10px; text-align: right;">Amount</th></tr>
        <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">Premium Payment</td><td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${data.amount || 'N/A'}</td></tr>
        <tr style="background: #f9fafb; font-weight: bold;"><td style="padding: 10px; border: 1px solid #e5e7eb;">Total Due</td><td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${data.amount || 'N/A'}</td></tr>
      </table>
      <p style="margin-top: 20px; font-size: 14px;"><strong>Payment Terms:</strong> ${data.paymentTerms || 'Due upon receipt'}</p>
      <div style="margin-top: 40px; font-size: 12px; color: #6b7280;"><p>Generated on: ${new Date().toLocaleDateString()}</p></div>
    </div>`,

  CANCELLATION_NOTICE: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border-bottom: 3px solid #e74c3c; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a365d; margin: 0;">IMGC Insurance</h1>
        <h2 style="color: #e74c3c; margin: 5px 0;">Policy Cancellation Notice</h2>
      </div>
      <p>Dear ${data.insuredName || 'Policyholder'},</p>
      <p>This is to notify you that your policy has been cancelled. Details below:</p>
      <table style="width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: bold;">Policy Number:</td><td style="padding: 8px;">${data.policyNumber || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Cancellation Date:</td><td style="padding: 8px;">${data.cancellationDate || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Reason:</td><td style="padding: 8px;">${data.reason || 'N/A'}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Refund Amount:</td><td style="padding: 8px;">${data.refundAmount || '$0'}</td></tr>
      </table>
      <div style="margin-top: 40px; font-size: 12px; color: #6b7280;"><p>Generated on: ${new Date().toLocaleDateString()}</p></div>
    </div>`,
};

export class DocumentGenerator {
  generateDocument(options: GenerateOptions): GeneratedDocument {
    const template = templateRepository.findById(options.templateId);
    if (!template) {
      throw new Error(`Template ${options.templateId} not found`);
    }

    const renderer = TEMPLATE_RENDERERS[template.type];
    if (!renderer) {
      throw new Error(`No renderer for template type ${template.type}`);
    }

    const content = renderer(options.mergeData);
    const filename = `${template.type.toLowerCase().replace(/_/g, '-')}_${Date.now()}.html`;

    const document: PolicyDocument = {
      id: generateId('DOC'),
      policyId: options.policyId || '',
      claimId: options.claimId,
      type: this.getDocumentType(template.type),
      category: template.category,
      filename,
      mimeType: 'text/html',
      size: Buffer.byteLength(content, 'utf-8'),
      uploadDate: new Date().toISOString(),
      uploadedBy: options.userId,
      version: 1,
      generatedFrom: template.id,
      metadata: {
        templateName: template.name,
        templateType: template.type,
        mergeData: JSON.stringify(options.mergeData),
        isGenerated: 'true',
        isVerified: 'true',
        verifiedBy: options.userId,
        verifiedAt: new Date().toISOString(),
      },
    };

    documentRepository.create(document);

    return { document, content };
  }

  getTemplates(): import('../models').DocumentTemplate[] {
    return templateRepository.findAll();
  }

  getTemplatesByCategory(category: string): import('../models').DocumentTemplate[] {
    return templateRepository.findByCategory(category);
  }

  private getDocumentType(templateType: TemplateType): import('../models').DocumentType {
    const mapping: Record<TemplateType, import('../models').DocumentType> = {
      POLICY_DECLARATION: 'Policy Declaration',
      CERTIFICATE_OF_INSURANCE: 'Certificate of Insurance',
      ENDORSEMENT_SCHEDULE: 'Endorsement Schedule',
      RENEWAL_NOTICE: 'Renewal Notice',
      CLAIMS_ACKNOWLEDGEMENT: 'Claims Correspondence',
      SETTLEMENT_OFFER: 'Settlement Letter',
      BILLING_INVOICE: 'Billing Invoice',
      CANCELLATION_NOTICE: 'Other',
    };
    return mapping[templateType] || 'Other';
  }
}

export const documentGenerator = new DocumentGenerator();
