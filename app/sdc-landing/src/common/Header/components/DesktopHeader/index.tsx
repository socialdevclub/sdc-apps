import { Style } from './index.style';
import SocialDevClubLogo from '../../../../assets/img/SocialDevClubLogo.png';
import SocialDevJoinButton from '../../../../assets/img/JoinButton.png';
import { MENU_LIST, openDisCodeHandler } from '../../../../config/common';

const DesktopHeader = () => {
  return (
    <>
      <Style.Container>
        <Style.HeaderLeft>
          <Style.Logo src={SocialDevClubLogo} />
        </Style.HeaderLeft>
        <Style.HeaderCenter>
          {MENU_LIST.map((item) => {
            return <Style.HeaderItem key={item}>{item}</Style.HeaderItem>;
          })}
        </Style.HeaderCenter>
        <Style.HeaderRight>
          <Style.LoginText>로그인</Style.LoginText>
          <Style.JoinButton onClick={openDisCodeHandler} src={SocialDevJoinButton} />
        </Style.HeaderRight>
      </Style.Container>
    </>
  );
};

export default DesktopHeader;
