import styled from '@emotion/styled';
import backgroundImage from '../../../../assets/img/SocialDevClubBackgroundImage.png';
import { MEDIA_QUERY } from '../../../../config/common';

const Container = styled.div`
  text-align: center;
`;

const BackgroundImage = styled.div`
  background-image: url(${backgroundImage});
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
`;

const Title = styled.div`
  color: #ae94ff;
  font-size: 1.5rem;
  font-family: Montserrat;
  @media ${MEDIA_QUERY.DESKTOP} {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.div`
  font-size: 1.125rem
  line-height: 150%;
  margin-top: 1.5rem;
  font-weight: 300;
  @media ${MEDIA_QUERY.DESKTOP} {
    font-size: 3.25rem;
  }
`;

const Highlight = styled.div`
  font-size: 1.125rem
  font-weight: 500;
  line-height: 150%;
  font-weight: 700;
  @media ${MEDIA_QUERY.DESKTOP} {
    font-size: 3.25rem;
  }
`;

const HighlightSpan = styled.span`
  color: #ae94ff;
`;

const Image = styled.img`
  width: 90%;
  height: auto;
  margin-bottom: 20px;
  margin-top: 30px;
  max-width: 800px;
`;

export const Style = {
  BackgroundImage,
  Container,
  Highlight,
  HighlightSpan,
  Image,
  Subtitle,
  Title,
};
