import { useEffect, useState } from 'react';
import { Style } from './index.style';
import SocialDevClubLogo from '../../../../assets/img/SocialDevClubLogo.png';
import MenuButton from '../../../../assets/img/MenuButton.png';
import SocialDevJoinButton from '../../../../assets/img/JoinButton.png';
import ProfileTempImage from '../../../../assets/img/ProfileTempImage.png';
import { MENU_LIST, openWindowHandler } from '../../../../config/common';

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen) {
      const { scrollY } = window;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.dataset.scrollY = String(scrollY);
    } else {
      const { scrollY } = document.body.dataset;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY ? parseInt(scrollY, 10) : 0);
      delete document.body.dataset.scrollY;
    }
  }, [isOpen]);
  return (
    <>
      <Style.Container>
        <Style.HeaderLeft>
          <Style.Logo src={SocialDevClubLogo} />
        </Style.HeaderLeft>
        <Style.HeaderRight>
          <Style.JoinButton onClick={() => openWindowHandler()} src={SocialDevJoinButton} />
          <Style.MenuButton
            src={MenuButton}
            onClick={() => {
              setIsOpen((prev: boolean) => !prev);
            }}
          />
        </Style.HeaderRight>
      </Style.Container>
      {isOpen && (
        <>
          <Style.Overlay onClick={() => setIsOpen(false)} />
          <Style.SideMenu>
            <Style.SideMenuHeader>
              <Style.Logo src={SocialDevClubLogo} />

              <Style.CloseButton onClick={() => setIsOpen(false)}>×</Style.CloseButton>
            </Style.SideMenuHeader>

            <Style.MenuList>
              <Style.ProfileContainer>
                <Style.ProfileImage src={ProfileTempImage} />
                <Style.LoginText>로그인</Style.LoginText>
              </Style.ProfileContainer>
              {MENU_LIST.map((menu) => {
                return <Style.MenuItem key={menu}>{menu}</Style.MenuItem>;
              })}
            </Style.MenuList>
          </Style.SideMenu>
        </>
      )}
    </>
  );
};

export default MobileHeader;
