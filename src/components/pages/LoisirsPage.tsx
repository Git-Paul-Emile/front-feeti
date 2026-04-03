import { LeisureCategoryPage } from './LeisureCategoryPage';

interface LoisirsPageProps {
  onBack: () => void;
}

export function LoisirsPage(_props: LoisirsPageProps) {
  return (
    <LeisureCategoryPage
      categorySlug="loisirs"
      pageTitle="Loisirs"
      heroBg="https://images.unsplash.com/photo-1529494792912-8ae2f7e8e1e5?w=1200&h=800&fit=crop"
    />
  );
}
