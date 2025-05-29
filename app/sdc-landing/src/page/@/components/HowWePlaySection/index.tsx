import { Style } from './index.style';
import SampleImage from '../../../../assets/img/SampleImage.png';

const HowWePlaySection = () => {
  const image = [SampleImage, SampleImage, SampleImage, SampleImage, SampleImage, SampleImage, SampleImage];
  const images = [...image, ...image, ...image, ...image];
  return (
    <Style.Container>
      <Style.Title>How We Play</Style.Title>
      <Style.Subtitle>게임으로 자연스럽게 가까워지는 사람들</Style.Subtitle>
      <Style.Highlight>누구나 편하게 섞일 수 있는 커뮤니티</Style.Highlight>
      <Style.Wrapper>
        <Style.SliderContainer>
          <Style.SlideTrack>
            {images.map((src, idx) => (
              <Style.SlideImage key={src} src={src} alt={`slide-${idx}`} />
            ))}
          </Style.SlideTrack>
          <Style.MaskOverlay />
        </Style.SliderContainer>
      </Style.Wrapper>
    </Style.Container>
  );
};

export default HowWePlaySection;
