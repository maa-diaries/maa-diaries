import type { ProductReview } from '../services/database';

export const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: 'default-rev-1',
    productId: 'jhumke-01',
    userName: 'Aishwarya R.',
    rating: 5,
    comment: 'Stunning anti-tarnish payals! I was skeptical but I have been wearing them daily in the shower and there is zero change in shine. Absolutely love Maa Diaries.',
    createdAt: '2025-06-15T10:30:00Z'
  },
  {
    id: 'default-rev-2',
    productId: 'jhumke-02',
    userName: 'Megha S.',
    rating: 5,
    comment: 'The metal clutchers are so strong and hold my thick hair perfectly. The rose theme packaging felt incredibly premium and luxury. Will buy again!',
    createdAt: '2025-06-20T14:15:00Z'
  },
  {
    id: 'default-rev-3',
    productId: 'jhumke-03',
    userName: 'Kavita J.',
    rating: 5,
    comment: 'Highly recommend the Kashmiri Jhumke. Heavy details but extremely lightweight on the ears. Hypoallergenic claim is true—no itchiness at all!',
    createdAt: '2025-06-25T09:45:00Z'
  }
];

const DELETED_DEFAULTS_KEY = 'deleted_default_reviews';

export function getDeletedDefaultReviewIds(): string[] {
  try {
    const stored = localStorage.getItem(DELETED_DEFAULTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function markDefaultReviewDeleted(reviewId: string): void {
  const deleted = getDeletedDefaultReviewIds();
  if (!deleted.includes(reviewId)) {
    deleted.push(reviewId);
    localStorage.setItem(DELETED_DEFAULTS_KEY, JSON.stringify(deleted));
  }
}

export function getVisibleDefaultReviews(): ProductReview[] {
  const deletedIds = getDeletedDefaultReviewIds();
  return DEFAULT_REVIEWS.filter(r => !deletedIds.includes(r.id));
}
