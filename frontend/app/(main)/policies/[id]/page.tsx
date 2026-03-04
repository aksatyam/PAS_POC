import PolicyDetailClient from './PolicyDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `POL-${String(1001 + i).padStart(4, '0')}`,
  }));
}

export default function Page() {
  return <PolicyDetailClient />;
}
