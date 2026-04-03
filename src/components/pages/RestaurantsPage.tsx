import { LeisureCategoryPage } from './LeisureCategoryPage';

interface RestaurantsPageProps {
  onBack: () => void;
}

export function RestaurantsPage(_props: RestaurantsPageProps) {
  return (
    <LeisureCategoryPage
      categorySlug="restaurants"
      pageTitle="Restaurants"
      heroBg="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop"
    />
  );
}
