'use client';

export const TRUST_LEVELS = {
  NEW: 'New Shortlet',
  LEVEL_1: 'Level 1',
  LEVEL_2: 'Level 2',
} as const;

export function getTrustLevel(verifiedSales: number, avgRating: number, reviewCount: number): string {
  // Level 2: 10+ Sales + 4.5 Rating
  if (verifiedSales >= 10 && avgRating >= 4.5) return TRUST_LEVELS.LEVEL_2;
  
  // Level 1: 3+ reviews with minimum 4.0 average
  if (reviewCount >= 3 && avgRating >= 4.0) return TRUST_LEVELS.LEVEL_1; 
  
  return TRUST_LEVELS.NEW;
}

export function SellerTrustBadge({ level }: { level: string }) {
  const badgeStyles: Record<string, string> = {
    [TRUST_LEVELS.NEW]: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400',
    [TRUST_LEVELS.LEVEL_1]: 'bg-teal-500/10 text-teal-600 border border-teal-200 dark:border-teal-500/20',
    [TRUST_LEVELS.LEVEL_2]: 'bg-[#BEF264]/20 text-black font-black border border-[#BEF264] dark:text-[#BEF264]'
  };

  return (
    <div className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-tighter shadow-sm ${badgeStyles[level] || badgeStyles[TRUST_LEVELS.NEW]}`}>
      {level}
    </div>
  );
}
