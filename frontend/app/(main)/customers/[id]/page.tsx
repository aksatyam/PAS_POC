import CustomerDetailClient from './CustomerDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `CUS-${String(100 + i).padStart(4, '0')}`,
  }));
}

export default function Page() {
  return <CustomerDetailClient />;
}
