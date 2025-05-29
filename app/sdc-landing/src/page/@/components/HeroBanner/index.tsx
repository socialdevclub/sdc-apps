import { useMediaQuery } from 'react-responsive';
import { MEDIA_QUERY } from '../../../../config/common';
import * as styles from './index.styles';

const DISCORD_INVITE_LINK = 'https://discord.gg/H8sq77NabR';

export const HeroBanner = () => {
  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });

  return (
    <styles.Container>
      <styles.TitleWrapper>
        <styles.TitleHighlightText
          strict
          text="Make, Share, Enjoy!"
          highlights={[
            {
              color: '#AE94FF',
              text: 'M',
            },
            {
              color: '#06DEDD',
              text: 'S',
            },
            {
              color: '#AE94FF',
              text: 'E',
            },
          ]}
        />
      </styles.TitleWrapper>
      <styles.TitleWrapper>
        <styles.TitleText>S</styles.TitleText>
        <styles.ChatImage src="src/assets/img/Chat.png" alt="chat" />
        <styles.TitleText>cial</styles.TitleText>
        <styles.DevWrapper>
          <styles.PurpleText fontFamily="DungGeunMo">&lt;</styles.PurpleText>
          Dev
          <styles.TealText>/</styles.TealText>
          <styles.PurpleText fontFamily="DungGeunMo">&gt;</styles.PurpleText>
        </styles.DevWrapper>
        <styles.TitleText>Club</styles.TitleText>
      </styles.TitleWrapper>
      <styles.SubTitle
        text={
          isDesktop
            ? '회사 밖에서 진짜 재미를 찾고 싶다면, 소데클에서 같이 게임 만들래?'
            : '소데클에서 같이 네트워킹 게임 만들래?'
        }
        highlights={[
          {
            color: '#AE94FF',
            text: '게임',
          },
          {
            color: '#AE94FF',
            text: '네트워킹 게임',
          },
          {
            color: 'white',
            text: '진짜 재미',
          },
        ]}
      />
      <styles.ButtonWrapper>
        <styles.Button onClick={() => window.open(DISCORD_INVITE_LINK, '_blank')}>합류하기</styles.Button>
      </styles.ButtonWrapper>
    </styles.Container>
  );
};
