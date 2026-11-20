export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (!Number.isFinite(originalPrice) || !Number.isFinite(discountedPrice)) return 0;
  if (originalPrice <= 0 || discountedPrice < 0 || discountedPrice > originalPrice) return 0;

  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
