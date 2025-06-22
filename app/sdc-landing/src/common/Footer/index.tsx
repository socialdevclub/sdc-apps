import { Style } from './index.style';
import Logo from '../../assets/img/SocialDevClubLogo.png';
import InstaLogo from '../../assets/img/InstaLogo.png';
import { openWindowHandler, INSTAAGRAM_LINK } from '../../config/common';

const Footer = () => {
  return (
    <Style.Wrapper>
      <Style.Container>
        <Style.LeftContainer>
          <Style.Group>
            <Style.Logo src={Logo} />
            <Style.Terms1>이용약관</Style.Terms1>
            <Style.Terms2>개인정보처리방침</Style.Terms2>
          </Style.Group>
          <Style.Copylight>{`© 2025 SOCIAL <Dev/> CLUB. all rights reserved.`}</Style.Copylight>
        </Style.LeftContainer>
        <Style.RightContainer>
          <Style.InstaLogo onClick={() => openWindowHandler(INSTAAGRAM_LINK)} src={InstaLogo} />
        </Style.RightContainer>
      </Style.Container>
    </Style.Wrapper>
  );
};

export default Footer;
