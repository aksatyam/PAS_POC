import { BaseRepository } from './base.repository';
import { DocumentTemplate, TemplateType } from '../models';

class TemplateRepository extends BaseRepository<DocumentTemplate> {
  constructor() {
    super('templates.json');
  }

  findByType(type: TemplateType): DocumentTemplate | undefined {
    return this.loadData().find((t) => t.type === type);
  }

  findByCategory(category: string): DocumentTemplate[] {
    return this.loadData().filter((t) => t.category === category);
  }
}

export const templateRepository = new TemplateRepository();
