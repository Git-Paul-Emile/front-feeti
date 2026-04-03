import { LeisureCategoryPage } from './LeisureCategoryPage';

interface SportsWellnessPageProps {
  onBack: () => void;
}

export function SportsWellnessPage(_props: SportsWellnessPageProps) {
  return (
    <LeisureCategoryPage
      categorySlug="sports"
      pageTitle="Sport & Bien-être"
      heroBg="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop"
    />
  );
}
