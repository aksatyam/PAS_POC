import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas';
import { Product } from '../models/product.model';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const dataPath = path.resolve(__dirname, '../../mock-data/products.json');

function loadProducts(): Product[] {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf-8')); } catch { return []; }
}
function saveProducts(data: Product[]) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }

// All routes require authentication
router.use(authenticate);

// List products
router.get('/', (_req: Request, res: Response) => {
  const products = loadProducts();
  res.json({ success: true, data: products });
});

// Get product by ID
router.get('/:id', (req: Request, res: Response) => {
  const products = loadProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// Create product (Admin only)
router.post('/', authorize('Admin'), validate(createProductSchema), auditLog('CREATE', 'Product'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const products = loadProducts();
  const product: Product = {
    id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
    name: req.body.name,
    code: req.body.code,
    description: req.body.description || '',
    status: req.body.status || 'Draft',
    policyType: req.body.policyType || 'Mortgage Guarantee',
    coverageOptions: req.body.coverageOptions || [],
    ratingFactors: req.body.ratingFactors || [],
    eligibilityCriteria: req.body.eligibilityCriteria || [],
    requiredDocuments: req.body.requiredDocuments || [],
    defaultTermMonths: req.body.defaultTermMonths || 12,
    minPremium: req.body.minPremium || 0,
    maxPremium: req.body.maxPremium || 0,
    commissionRate: req.body.commissionRate || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: user.userId,
  };
  products.push(product);
  saveProducts(products);
  res.status(201).json({ success: true, data: product });
});

// Update product (Admin only)
router.put('/:id', authorize('Admin'), validate(updateProductSchema), auditLog('UPDATE', 'Product'), (req: Request, res: Response) => {
  const products = loadProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  products[idx] = { ...products[idx], ...req.body, id: products[idx].id, updatedAt: new Date().toISOString() };
  saveProducts(products);
  res.json({ success: true, data: products[idx] });
});

// Delete product - soft delete (Admin only)
router.delete('/:id', authorize('Admin'), auditLog('DELETE', 'Product'), (req: Request, res: Response) => {
  const products = loadProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  products[idx].status = 'Inactive';
  products[idx].updatedAt = new Date().toISOString();
  saveProducts(products);
  res.json({ success: true, message: 'Product deactivated' });
});

export default router;
