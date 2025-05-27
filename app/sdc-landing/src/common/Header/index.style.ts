import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 13px 16px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #111;
`;
const Logo = styled.img`
  width: 43px;
  height: 35px;
`;
const JoinButton = styled.img`
  width: 100px;
  margin-right: 10px;
`;
const JoinText = styled.span`
  font-size: 14px;
  font-weight: 700;
`;

const MenuButton = styled.img`
  width: 25px;
  height: 25px;
`;
const HeaderLeft = styled.div``;
const HeaderRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SideMenu = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 60%;
  height: 100vh;
  background-color: black;
  color: white;
  z-index: 1000;
  padding: 24px;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      right: -100%;
    }
    to {
      right: 0;
    }
  }
`;

const CloseButton = styled.div`
  font-size: 28px;
  align-self: flex-end;
  cursor: pointer;
`;

const MenuList = styled.ul`
  list-style: none;
  margin-top: 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  li {
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #333;
    padding-bottom: 8px;
  }
`;

const SideMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;
const ProfileImage = styled.img`
  width: 56px;
  height: 56px;
`;
const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 24px;
  border-bottom: 1px solid #454545;
  margin-bottom: 20px;
`;
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(1px);
  background-color: rgba(0, 0, 0, 0.2); /* 흐릿함 + 어두움 */
  z-index: 999;
`;

const MenuItem = styled.li`
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
  cursor: pointer;

  &:hover {
    color: #00f0ff;
  }
`;

const LoginText = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
`;
export const Style = {
  CloseButton,
  Container,
  HeaderLeft,
  HeaderRight,
  JoinButton,
  JoinText,
  LoginText,
  Logo,
  MenuButton,
  MenuItem,
  MenuList,
  Overlay,
  ProfileContainer,
  ProfileImage,
  SideMenu,
  SideMenuHeader,
};
