import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Calendar,
  Gift,
  Heart,
  ArrowLeft,
  Search,
  Loader2,
} from 'lucide-react';
import { BonPlanCard } from '../BonPlanCard';
import { toast } from 'sonner@2.0.3';
import DealsBackendAPI from '../../services/api/DealsBackendAPI';
import { backendDealToBonPlan, type BonPlan } from '../../services/api/dealAdapters';

interface BonPlansPageProps {
  onBack: () => void;
  onNavigate?: (page: string, params?: any) => void;
  filter?: string;
}

export function BonPlansPage({ onBack, onNavigate, filter }: BonPlansPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(filter || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState<BonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(filter || 'all');
  }, [filter]);

  useEffect(() => {
    let isMounted = true;

    DealsBackendAPI.getDeals({ page: 1, limit: 50, sortBy: 'popularity' })
      .then(({ data }) => {
        if (!isMounted) return;
        setPlans(data.map(backendDealToBonPlan));
      })
      .catch(() => {
        if (!isMounted) return;
        toast.error('Erreur lors du chargement des bons plans');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCTAClick = (planId: string) => {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;

    toast.success(`Redirection vers l'achat de: ${plan.title}`);
    onNavigate?.('deals-list', { filter: selectedCategory });
  };

  const handleWishlistToggle = (planId: string, isAdded: boolean) => {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;

    if (isAdded) {
      toast.success(`${plan.title} ajouté à vos favoris`);
      return;
    }

    toast.info(`${plan.title} retiré de vos favoris`);
  };

  const filteredBonPlans = plans.filter((plan) => {
    const matchesCategory = selectedCategory === 'all'
      || (selectedCategory === 'weekly' && plan.category === 'weekly')
      || (selectedCategory === 'general' && plan.category === 'general')
      || (selectedCategory === 'feeti-na-feeti' && plan.category === 'feeti-na-feeti');

    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = plan.title.toLowerCase().includes(normalizedSearch)
      || plan.description.toLowerCase().includes(normalizedSearch)
      || plan.merchantName.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'weekly':
        return 'Bonplans par semaine';
      case 'general':
        return 'Tous nos bons plans';
      case 'feeti-na-feeti':
        return 'Feeti Na Feeti';
      default:
        return 'Tous les bons plans';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getCategoryTitle(selectedCategory)}
              </h1>
              <p className="text-gray-600 mt-1">
                Découvrez nos offres exceptionnelles et économisez sur vos sorties
              </p>
            </div>
          </div>
          {onNavigate && (
            <Button
              onClick={() => onNavigate('deals-list', { filter: selectedCategory })}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Voir tous les bons plans
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Tous</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Semaine</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Général</span>
              </TabsTrigger>
              <TabsTrigger value="feeti-na-feeti" className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Feeti Na Feeti</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {filteredBonPlans.map((plan) => (
              <BonPlanCard
                key={plan.id}
                plan={plan}
                variant="compact"
                onCTAClick={handleCTAClick}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredBonPlans.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun bon plan trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de changer vos filtres ou revenez plus tard pour découvrir de nouvelles offres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
