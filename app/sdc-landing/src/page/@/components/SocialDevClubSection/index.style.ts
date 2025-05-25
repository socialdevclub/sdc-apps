import styled from '@emotion/styled';
import backgroundImage from '../../../../assets/img/SocialDevClubBackgroundImage.png';

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
  font-size: 24px;
  font-family: 'Helvetica Neue LT Pro 83 HvEx';
`;

const Subtitle = styled.div`
  font-size: 18px;
  line-height: 150%;
  margin-top: 15px;
`;

const Highlight = styled.div`
  font-size: 18px;
  font-weight: 500;
  line-height: 150%;
`;

const HighlightSpan = styled.span`
  color: #ae94ff;
`;

const Image = styled.img`
  width: 90%;
  height: auto;
  margin-bottom: 20px;
  margin-top: 30px;
  max-width: 350px;
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
