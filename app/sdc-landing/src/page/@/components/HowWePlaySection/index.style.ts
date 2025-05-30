import styled from '@emotion/styled';
import { MEDIA_QUERY } from '../../../../config/common';

const Container = styled.div`
  text-align: center;
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
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 150%;
  margin-top: 0.5rem;
  @media ${MEDIA_QUERY.DESKTOP} {
    font-size: 2rem;
    margin-top: 1rem;
  }
`;

const Highlight = styled.div`
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 150%;

  @media ${MEDIA_QUERY.DESKTOP} {
    font-size: 2rem;
  }
`;

const HighlightSpan = styled.span`
  color: #ae94ff;
`;

const Image = styled.img`
  width: 90%;
  height: auto;
  margin-bottom: 20px;
  margin-top: 50px;
  max-width: 500px;
`;

const SliderWrapper = styled.div`
  overflow: hidden;
  width: 100%;
`;

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 40px 0;
`;

const SlideTrack = styled.div`
  display: flex;
  width: fit-content;
  animation: scroll 180s linear infinite;
  @keyframes scroll {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;

const SlideImage = styled.img`
  width: 160px;
  height: auto;
  margin: 0 5px;
  flex-shrink: 0;

  @media ${MEDIA_QUERY.DESKTOP} {
    width: 300px;
    
  }
`;

const MaskOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: linear-gradient(to right, #000 0%, transparent 15%, transparent 85%, #000 100%);
  z-index: 1;
`;

const SliderContainer = styled.div`
display: flex;
  justify-content: center; // 추가
  position: relative;
  overflow: hidden;
  width: 100%;
`;

export const Style = {
  Container,
  Highlight,
  HighlightSpan,
  Image,
  MaskOverlay,
  SlideImage,
  SlideTrack,
  SliderContainer,
  SliderWrapper,
  Subtitle,
  Title,
  Wrapper,
};
