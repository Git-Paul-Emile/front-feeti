import { LeisureCategoryPage } from './LeisureCategoryPage';

interface EnvoleePageProps {
  onBack: () => void;
}

export function EnvoleePage(_props: EnvoleePageProps) {
  return (
    <LeisureCategoryPage
      categorySlug="envolee"
      pageTitle="Évasion"
      heroBg="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop"
    />
  );
}
