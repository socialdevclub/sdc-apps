export const MEDIA_QUERY = {
  DESKTOP: '(min-width: 800px)',
  MOBILE: '(max-width: 800px)',
} as const;
export const MENU_LIST = ['게임', 'EVENT', '소셜 활동', '크루원 소개', '팀 블로그', '협업문의'];
export const DISCORD_INVITE_LINK = 'https://discord.gg/H8sq77NabR';
export const openDisCodeHandler = (): void => {
  window.open(DISCORD_INVITE_LINK, '_blank');
};
