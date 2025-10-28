/**
 * Get greeting message based on current time
 */
export const getGreetingMessage = (name: string, t: (key: string, options?: any) => string): string => {
  const hour = new Date().getHours();
  const firstName = getFirstName(name);
  
  if (hour >= 5 && hour < 12) {
    return t('home.goodMorning', { name: firstName });
  } else if (hour >= 12 && hour < 18) {
    return t('home.goodDay', { name: firstName });
  } else if (hour >= 18 && hour < 22) {
    return t('home.goodEvening', { name: firstName });
  } else {
    return t('home.goodNight', { name: firstName });
  }
};

/**
 * Get first name from full name
 */
export const getFirstName = (fullName: string): string => {
  if (!fullName) return 'User';
  
  const trimmedName = fullName.trim();
  const words = trimmedName.split(/\s+/);
  
  return words[0] || 'User';
};