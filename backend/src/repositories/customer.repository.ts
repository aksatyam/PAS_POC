import { BaseRepository } from './base.repository';
import { Customer } from '../models';

class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super('customers.json');
  }

  search(query: string): Customer[] {
    const lower = query.toLowerCase();
    return this.loadData().filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower) ||
        c.phone.includes(query)
    );
  }

  findByEmail(email: string): Customer | undefined {
    return this.loadData().find((c) => c.email === email);
  }

  findByRiskCategory(category: string): Customer[] {
    return this.loadData().filter((c) => c.riskCategory === category);
  }
}

export const customerRepository = new CustomerRepository();
