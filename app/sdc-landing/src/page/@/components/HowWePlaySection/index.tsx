import { Style } from './index.style';
import SocialDevClubPeople1 from '../../../../assets/img/SocialDevClubPeople1.jpg';
import SocialDevClubPeople2 from '../../../../assets/img/SocialDevClubPeople2.jpg';
import SocialDevClubPeople3 from '../../../../assets/img/SocialDevClubPeople3.jpg';
import SocialDevClubPeople4 from '../../../../assets/img/SocialDevClubPeople4.jpg';
import SocialDevClubPeople5 from '../../../../assets/img/SocialDevClubPeople5.jpg';
import SocialDevClubPeople6 from '../../../../assets/img/SocialDevClubPeople6.jpg';
import SocialDevClubPeople7 from '../../../../assets/img/SocialDevClubPeople7.jpg';
import SocialDevClubPeople8 from '../../../../assets/img/SocialDevClubPeople8.jpg';

const HowWePlaySection = () => {
  const image = [
    SocialDevClubPeople1,
    SocialDevClubPeople2,
    SocialDevClubPeople3,
    SocialDevClubPeople4,
    SocialDevClubPeople5,
    SocialDevClubPeople6,
    SocialDevClubPeople7,
    SocialDevClubPeople8,
  ];
  const images = [...image, ...image, ...image];
  return (
    <Style.Container>
      <Style.Title>How We Play</Style.Title>
      <Style.Subtitle>게임으로 자연스럽게 가까워지는 사람들</Style.Subtitle>
      <Style.Highlight>누구나 편하게 섞일 수 있는 커뮤니티</Style.Highlight>
      <Style.Wrapper>
        <Style.SliderContainer>
          <Style.SlideTrack>
            {images.map((src, idx) => (
              <Style.SlideImage key={`${src}-${idx + 1}`} src={src} alt={`slide-${idx}`} />
            ))}
          </Style.SlideTrack>
          <Style.MaskOverlay />
        </Style.SliderContainer>
      </Style.Wrapper>
    </Style.Container>
  );
};

export default HowWePlaySection;
