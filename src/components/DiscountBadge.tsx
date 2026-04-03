import { Badge } from './ui/badge';
import { Percent } from 'lucide-react';

interface DiscountBadgeProps {
  discount: number;
  className?: string;
  showIcon?: boolean;
}

export function DiscountBadge({ discount, className = '', showIcon = true }: DiscountBadgeProps) {
  const getDiscountColor = (discount: number) => {
    if (discount >= 50) return 'bg-red-500 text-white';
    if (discount >= 30) return 'bg-orange-500 text-white';
    if (discount >= 20) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  return (
    <Badge className={`${getDiscountColor(discount)} ${className}`}>
      {showIcon && <Percent className="w-3 h-3 mr-1" />}
      -{discount}%
    </Badge>
  );
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}