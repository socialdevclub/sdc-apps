import styled from '@emotion/styled';

const Container = styled.div`
  display: grid;
  padding: 13px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: rgb(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);

  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-width: 1100px; // ✅ 최소 너비 지정
`;

const Logo = styled.img`
  width: 53px;
  height: 45px;
`;

const JoinButton = styled.img`
  width: 130px;
  height: 46px;
  object-fit: cover;
`;

const HeaderLeft = styled.div``;

const HeaderCenter = styled.div`
  display: flex;
  gap: 53px;
  justify-content: center; /* ✅ 더 명확하게 중앙 정렬 */
  place-self: center;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const HeaderItem = styled.span`
  font-weight: 500;
  cursor: pointer;
`;
const LoginText = styled.div`
  font-weight: 500;
  margin-right: 32px;
`;

export const Style = {
  Container,
  HeaderCenter,
  HeaderItem,
  HeaderLeft,
  HeaderRight,
  JoinButton,
  LoginText,
  Logo,
};
