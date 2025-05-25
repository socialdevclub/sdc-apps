import * as styles from './index.styles';

export const BigBanner = () => {
  return (
    <styles.Container>
      <styles.TitleWrapper>
        <styles.TitleText>Experiential ga</styles.TitleText>
        <styles.GamepadImage src="/asset/img/gamepad.png" alt="gamepad" />
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
        <styles.ChatImage src="/asset/img/chat.png" alt="chat" />
        <styles.TitleText>mmunity</styles.TitleText>
      </styles.TitleWrapper>
      <styles.SubTitle>
        소데클에서 같이 <styles.PurpleText>네트워킹 게임</styles.PurpleText> 만들래?
      </styles.SubTitle>
      <styles.ButtonWrapper>
        <styles.Button>합류하기</styles.Button>
      </styles.ButtonWrapper>
    </styles.Container>
  );
};
