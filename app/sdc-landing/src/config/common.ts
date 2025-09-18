export const MEDIA_QUERY = {
  DESKTOP: '(min-width: 800px)',
  MOBILE: '(max-width: 800px)',
} as const;
export const MENU_LIST = ['게임', 'EVENT', '소셜 활동', '크루원 소개', '팀 블로그', '협업문의'];
export const DISCORD_INVITE_LINK = 'https://forms.gle/ofow8VAwD1uJrArS6';
export const INSTAAGRAM_LINK = 'https://www.instagram.com/socialdev.club/';
export const openWindowHandler = (url = DISCORD_INVITE_LINK): void => {
  window.open(url, '_blank');
};
