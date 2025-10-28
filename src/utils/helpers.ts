/**
 * Get greeting message based on current time
 */
export const getGreetingMessage = (name: string): string => {
  const hour = new Date().getHours();
  const firstName = getFirstName(name);
  
  if (hour >= 5 && hour < 12) {
    return `Günaydın ${firstName}`;
  } else if (hour >= 12 && hour < 18) {
    return `İyi Günler ${firstName}`;
  } else if (hour >= 18 && hour < 22) {
    return `İyi Akşamlar ${firstName}`;
  } else {
    return `İyi Geceler ${firstName}`;
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