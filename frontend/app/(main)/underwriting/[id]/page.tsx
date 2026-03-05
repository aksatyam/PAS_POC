import UWDetailClient from './UWDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `UW-${String(4001 + i).padStart(4, '0')}`,
  }));
}

export default function UnderwritingDetailPage() {
  return <UWDetailClient />;
}
