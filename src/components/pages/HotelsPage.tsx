import { LeisureCategoryPage } from './LeisureCategoryPage';

interface HotelsPageProps {
  onBack: () => void;
}

export function HotelsPage(_props: HotelsPageProps) {
  return (
    <LeisureCategoryPage
      categorySlug="hotels"
      pageTitle="Hôtels"
      heroBg="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop"
    />
  );
}
