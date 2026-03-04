import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const MOCK_DATA_DIR = path.resolve(__dirname, '../../mock-data');

export class BaseRepository<T extends { id: string }> {
  protected data: T[] | null = null;
  protected filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(MOCK_DATA_DIR, filename);
  }

  protected loadData(): T[] {
    if (this.data === null) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } catch {
        this.data = [];
      }
    }
    return this.data!;
  }

  protected saveData(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      logger.error(`Failed to save data to ${this.filePath}:`, { error: err });
    }
  }

  findAll(): T[] {
    return [...this.loadData()];
  }

  findById(id: string): T | undefined {
    return this.loadData().find((item) => item.id === id);
  }

  async create(item: T): Promise<T> {
    this.loadData();
    this.data!.push(item);
    this.saveData();
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    this.loadData();
    const index = this.data!.findIndex((item) => item.id === id);
    if (index === -1) return undefined;

    this.data![index] = { ...this.data![index], ...updates };
    this.saveData();
    return this.data![index];
  }

  async delete(id: string): Promise<boolean> {
    this.loadData();
    const index = this.data!.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.data!.splice(index, 1);
    this.saveData();
    return true;
  }

  count(): number {
    return this.loadData().length;
  }

  findByFilter(predicate: (item: T) => boolean): T[] {
    return this.loadData().filter(predicate);
  }

  paginate(items: T[], page: number, limit: number): { data: T[]; total: number } {
    const total = items.length;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);
    return { data, total };
  }
}
