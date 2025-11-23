/**
 * Calculate days until expiration
 * @param expiresAt - ISO date string or Date object
 * @returns Number of days until expiration (negative if expired, 0 if today, positive if future)
 */
export function getDaysUntilExpiration(expiresAt: string | Date | undefined | null): number | null {
  if (!expiresAt) return null;
  
  const expiresDate = new Date(expiresAt);
  const today = new Date();
  
  // Set both to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0);
  expiresDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiresDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format expiration date for display
 * @param expiresAt - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatExpirationDate(expiresAt: string | Date | undefined | null): string {
  if (!expiresAt) return '';
  
  const date = new Date(expiresAt);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Get expiration status badge info
 * @param daysLeft - Days until expiration (from getDaysUntilExpiration)
 * @returns Object with variant and label
 */
export function getExpirationBadgeInfo(daysLeft: number | null): { variant: 'destructive' | 'default' | 'secondary', label: string } | null {
  if (daysLeft === null) return null;
  
  if (daysLeft < 0) {
    return { variant: 'destructive', label: 'Expired' };
  }
  
  if (daysLeft === 0) {
    return { variant: 'destructive', label: 'Expires today' };
  }
  
  if (daysLeft === 1) {
    return { variant: 'destructive', label: '1 day left' };
  }
  
  if (daysLeft <= 3) {
    return { variant: 'destructive', label: `${daysLeft} days left` };
  }
  
  if (daysLeft <= 7) {
    return { variant: 'default', label: `${daysLeft} days left` };
  }
  
  return { variant: 'secondary', label: `${daysLeft} days left` };
}

