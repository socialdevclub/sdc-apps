import styled from '@emotion/styled';
import { MEDIA_QUERY } from '../../config/common';

const Wrapper = styled.div`
  border-top: 1px solid #333333;
  background-color: #000000;
  padding: 40px 16px;
  margin-top: 0px;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
`;

const LeftContainer = styled.div``;

const RightContainer = styled.div``;

const Logo = styled.img`
  width: 77px;
  height: 65px;
  margin-bottom: 32px;
  @media ${MEDIA_QUERY.DESKTOP} {
    margin-bottom: 0px;
  }
`;

const Terms1 = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;

  @media ${MEDIA_QUERY.DESKTOP} {
    margin-bottom: 0px;
  }
`;

const Terms2 = styled.span`
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const Group = styled.div`
  @media ${MEDIA_QUERY.DESKTOP} {
    display: flex;
    gap: 40px;
  }
`;

const Copylight = styled.div`
  color: #999999;
  margin-top: 56px;
`;

const InstaLogo = styled.img`
  width: 56px;
  height: 56px;
`;

export const Style = {
  Container,
  Copylight,
  Group,
  InstaLogo,
  LeftContainer,
  Logo,
  RightContainer,
  Terms1,
  Terms2,
  Wrapper,
};
