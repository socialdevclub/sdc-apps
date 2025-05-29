import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 13px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #000;
  align-items:center;
`;

const Logo = styled.img`
  width: 53px;
  height: 45px;
`;

const JoinButton = styled.img`
  width: 150px;
  height:70px;
  object-fit:cover;
`;




const HeaderLeft = styled.div``;

const HeaderCenter = styled.div`
  display: flex;
  gap:53px
  
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const HeaderItem = styled.span`
font-weight:500;
`
const LoginText = styled.div`
font-weight:500;
margin-right:20px;
`

export const Style = {
  Container,
  HeaderLeft,
  HeaderRight,
  JoinButton,
  Logo,
  HeaderCenter,
  HeaderItem,
  LoginText
};
