import { PolicyDocument, DocumentCategory } from '../models';
import { documentRepository } from '../repositories/document.repository';
import { generateId } from '../utils/id-generator';

export class DocumentService {
  async uploadDocument(data: Partial<PolicyDocument>, userId: string): Promise<PolicyDocument> {
    const doc: PolicyDocument = {
      id: generateId('DOC'),
      policyId: data.policyId || '',
      claimId: data.claimId,
      type: data.type || 'Other',
      category: data.category || 'General',
      filename: data.filename || 'unknown',
      mimeType: data.mimeType || 'application/octet-stream',
      size: data.size || 0,
      uploadDate: new Date().toISOString(),
      uploadedBy: userId,
      version: data.parentDocumentId ? this.getNextVersion(data.parentDocumentId) : 1,
      parentDocumentId: data.parentDocumentId,
      metadata: data.metadata || {},
    };

    await documentRepository.create(doc);
    return doc;
  }

  listByPolicy(policyId: string): PolicyDocument[] {
    return documentRepository.findByPolicyId(policyId);
  }

  listByClaim(claimId: string): PolicyDocument[] {
    return documentRepository.findByClaimId(claimId);
  }

  listByCategory(category: DocumentCategory): PolicyDocument[] {
    return documentRepository.findByCategory(category);
  }

  getDocument(id: string): PolicyDocument | undefined {
    return documentRepository.findById(id);
  }

  getVersions(documentId: string): PolicyDocument[] {
    return documentRepository.findVersions(documentId);
  }

  async verifyDocument(id: string, userId: string): Promise<PolicyDocument | undefined> {
    const doc = documentRepository.findById(id);
    if (!doc) return undefined;

    const updated = await documentRepository.update(id, {
      metadata: {
        ...doc.metadata,
        isVerified: 'true',
        verifiedBy: userId,
        verifiedAt: new Date().toISOString(),
      },
    });
    return updated || undefined;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return documentRepository.delete(id);
  }

  listAll(
    page: number = 1,
    limit: number = 20,
    filters?: { category?: string; type?: string; policyId?: string }
  ): { data: PolicyDocument[]; total: number } {
    let all = documentRepository.findAll();

    if (filters?.category) {
      all = all.filter((d) => d.category === filters.category);
    }
    if (filters?.type) {
      all = all.filter((d) => d.type === filters.type);
    }
    if (filters?.policyId) {
      all = all.filter((d) => d.policyId === filters.policyId);
    }

    // Sort by upload date descending
    all.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return documentRepository.paginate(all, page, limit);
  }

  private getNextVersion(parentDocumentId: string): number {
    const versions = documentRepository.findVersions(parentDocumentId);
    return versions.length > 0 ? versions[0].version + 1 : 2;
  }
}

export const documentService = new DocumentService();
