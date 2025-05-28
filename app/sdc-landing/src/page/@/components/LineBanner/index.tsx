import * as styles from './index.styles';

export const LineBanner = () => {
  return (
    <styles.Container
      text="체험형 게임 개발 커뮤니티, 소셜데브클럽입니다 :)"
      highlights={[
        {
          color: '#06DEDD',
          text: '소셜데브클럽',
        },
      ]}
    />
  );
};
