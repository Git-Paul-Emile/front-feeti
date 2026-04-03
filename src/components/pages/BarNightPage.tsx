import { LeisureCategoryPage } from './LeisureCategoryPage';

interface BarNightPageProps {
  onBack: () => void;
}

export function BarNightPage(_props: BarNightPageProps) {
  return (
    <LeisureCategoryPage
      categorySlug="bar-night"
      pageTitle="Bar & Nuit"
      heroBg="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200&h=800&fit=crop"
    />
  );
}
