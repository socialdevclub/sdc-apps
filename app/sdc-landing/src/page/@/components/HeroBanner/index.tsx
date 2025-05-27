import { useMediaQuery } from 'react-responsive';
import { MEDIA_QUERY } from '../../../../config/common';
import * as styles from './index.styles';

export const HeroBanner = () => {
  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });

  return (
    <styles.Container>
      <styles.TitleWrapper>
        <styles.TitleText>Experiential ga</styles.TitleText>
        <styles.GamepadImage src="src/assets/img/Gamepad.png" alt="gamepad" />
        <styles.TitleText>e</styles.TitleText>
      </styles.TitleWrapper>
      <styles.TitleWrapper>
        <styles.DevWrapper>
          <styles.PurpleText fontFamily="DungGeunMo">&lt;</styles.PurpleText>
          Dev
          <styles.TealText>/</styles.TealText>
          <styles.PurpleText fontFamily="DungGeunMo">&gt;</styles.PurpleText>
        </styles.DevWrapper>
        <styles.TitleText>C</styles.TitleText>
        <styles.ChatImage src="src/assets/img/Chat.png" alt="chat" />
        <styles.TitleText>mmunity</styles.TitleText>
      </styles.TitleWrapper>
      <styles.SubTitle
        text={
          isDesktop
            ? '일상의 지루함이 느껴진다면, 소데클에서 같이 네트워킹 게임 만들래?'
            : '소데클에서 같이 네트워킹 게임 만들래?'
        }
        highlights={[{ color: '#AE94FF', text: '네트워킹 게임' }]}
      />
      <styles.ButtonWrapper>
        <styles.Button>합류하기</styles.Button>
      </styles.ButtonWrapper>
    </styles.Container>
  );
};
