export type RiskCategory = 'Low' | 'Medium' | 'High';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: string;
  riskCategory: RiskCategory;
  createdAt: string;
  updatedAt: string;
}
