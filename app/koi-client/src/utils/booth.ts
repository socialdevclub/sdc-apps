/**
 * Booth mode utilities
 */

/**
 * Check if the application is running in booth mode
 */
export const isBoothMode = (): boolean => {
  return import.meta.env.PUBLIC_BOOTH_MODE === 'true';
};

/**
 * Generate a booth user ID from nickname
 */
export const generateBoothUserId = (nickname: string): string => {
  return `booth_${nickname}`;
};

/**
 * Check if a user ID is a booth mode guest user
 */
export const isBoothGuest = (userId: string): boolean => {
  return userId.startsWith('booth_');
};

/**
 * Extract nickname from booth user ID
 */
export const extractNicknameFromBoothUserId = (userId: string): string => {
  if (!isBoothGuest(userId)) {
    return userId;
  }
  return userId.replace('booth_', '');
};
