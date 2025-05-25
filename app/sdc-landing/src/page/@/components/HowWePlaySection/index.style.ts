import styled from '@emotion/styled';

const Container = styled.div`
  text-align: center;
`;

const Title = styled.div`
  color: #ae94ff;
  font-size: 24px;
  font-family: 'Helvetica Neue LT Pro 83 HvEx';
`;

const Subtitle = styled.div`
  font-size: 1rem;
  line-height: 150%;
  margin-top: 15px;
`;

const Highlight = styled.div`
  font-size: 1rem;
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
  animation: scroll 60s linear infinite;
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
  width: 100px;
  height: auto;
  margin: 0 5px;
  flex-shrink: 0;
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
  position: relative;
  z-index: 0;
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
