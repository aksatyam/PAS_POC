import BillingDetailClient from './BillingDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `BIL-${String(3001 + i).padStart(4, '0')}`,
  }));
}

export default function Page() {
  return <BillingDetailClient />;
}
