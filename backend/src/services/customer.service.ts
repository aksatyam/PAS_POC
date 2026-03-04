import { Customer } from '../models';
import { customerRepository } from '../repositories/customer.repository';
import { policyRepository } from '../repositories/policy.repository';
import { generateId } from '../utils/id-generator';

export class CustomerService {
  getAll(page: number = 1, limit: number = 20): { data: Customer[]; total: number } {
    const all = customerRepository.findAll();
    return customerRepository.paginate(all, page, limit);
  }

  getById(id: string): Customer | undefined {
    return customerRepository.findById(id);
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const now = new Date().toISOString();
    const customer: Customer = {
      id: generateId('CUST'),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      dob: data.dob || '',
      address: data.address || { street: '', city: '', state: '', pincode: '' },
      contact: data.contact || '',
      riskCategory: data.riskCategory || 'Medium',
      createdAt: now,
      updatedAt: now,
    };

    await customerRepository.create(customer);
    return customer;
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const existing = customerRepository.findById(id);
    if (!existing) {
      throw new Error('Customer not found');
    }

    const updated = await customerRepository.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new Error('Failed to update customer');
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = customerRepository.findById(id);
    if (!existing) {
      throw new Error('Customer not found');
    }
    return customerRepository.delete(id);
  }

  getCustomerWithPolicies(id: string) {
    const customer = customerRepository.findById(id);
    if (!customer) return undefined;

    const policies = policyRepository.findByCustomer(id);
    return { ...customer, policies };
  }

  searchCustomers(query: string): Customer[] {
    return customerRepository.search(query);
  }
}

export const customerService = new CustomerService();
