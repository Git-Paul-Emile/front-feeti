import type { BackendDeal } from './DealsBackendAPI';

export interface BonPlan {
  id: string;
  title: string;
  description: string;
  category: 'weekly' | 'general' | 'feeti-na-feeti' | 'restaurants' | 'hotels' | 'activities' | 'shopping';
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  location: string;
  image: string;
  isPopular: boolean;
  merchantName: string;
  tags: string[];
  availableQuantity?: number;
  maxQuantity?: number;
  rating?: number;
  reviewCount?: number;
}

export function backendDealToBonPlan(deal: BackendDeal): BonPlan {
  let tags: string[] = [];

  try {
    tags = JSON.parse(deal.tags);
  } catch {
    tags = [];
  }

  return {
    id: deal.id,
    title: deal.title,
    description: deal.description,
    category: deal.category as BonPlan['category'],
    originalPrice: deal.originalPrice,
    discountedPrice: deal.discountedPrice,
    discount: deal.discount,
    validUntil: deal.validUntil,
    location: deal.location,
    image: deal.image,
    isPopular: deal.isPopular,
    merchantName: deal.merchantName,
    tags,
    availableQuantity: deal.availableQuantity ?? undefined,
    maxQuantity: deal.maxQuantity ?? undefined,
    rating: deal.rating ?? undefined,
    reviewCount: deal.reviewCount ?? undefined,
  };
}
