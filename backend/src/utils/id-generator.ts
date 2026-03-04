import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const counters: Record<string, number> = {};

function getNextCounter(prefix: string, dataFile?: string): number {
  if (counters[prefix] !== undefined) {
    counters[prefix]++;
    return counters[prefix];
  }

  // Try to determine the next number from existing data
  let maxNum = 0;
  if (dataFile) {
    try {
      const filePath = path.resolve(__dirname, '../../mock-data', dataFile);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.id) {
            const match = item.id.match(/(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  counters[prefix] = maxNum + 1;
  return counters[prefix];
}

export function generatePolicyId(): string {
  const year = new Date().getFullYear();
  const num = getNextCounter('POL', 'policies.json');
  return `POL-${year}-${String(num).padStart(5, '0')}`;
}

export function generateClaimId(): string {
  const num = getNextCounter('CLM', 'claims.json');
  return `CLM${String(num).padStart(3, '0')}`;
}

export function generateId(prefix: string): string {
  const short = uuidv4().split('-')[0];
  return `${prefix}-${short}`;
}

export function generateLogId(): string {
  return `LOG-${uuidv4()}`;
}

export function generateEndorsementId(): string {
  const num = getNextCounter('END', 'endorsements.json');
  return `END-${String(num).padStart(5, '0')}`;
}

export function generateRenewalId(): string {
  const num = getNextCounter('RNW', 'renewals.json');
  return `RNW-${String(num).padStart(5, '0')}`;
}

export function generateQuoteId(): string {
  const year = new Date().getFullYear();
  const num = getNextCounter('QT', 'policies.json');
  return `QT-${year}-${String(num).padStart(5, '0')}`;
}
