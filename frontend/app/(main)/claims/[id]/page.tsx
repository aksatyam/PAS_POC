import ClaimDetailClient from './ClaimDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `CLM-${String(2001 + i).padStart(4, '0')}`,
  }));
}

export default function Page() {
  return <ClaimDetailClient />;
}
