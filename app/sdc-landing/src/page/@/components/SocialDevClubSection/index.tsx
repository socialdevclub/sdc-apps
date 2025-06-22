import { Style } from './index.style';
import SocialDevClubPeopleImage from '../../../../assets/img/SocialDevClubImage.png';

const SocialDevClubSection = () => {
  return (
    <Style.Container>
      <Style.BackgroundImage>
        <Style.Title>Social Dev Club</Style.Title>
        <Style.Subtitle>게임으로 사람과 사람을 연결하는</Style.Subtitle>
        <Style.Highlight>
          네트워킹 게임 개발 커뮤니티, <Style.HighlightSpan>소셜데브클럽</Style.HighlightSpan>
        </Style.Highlight>
      </Style.BackgroundImage>
      <Style.Image src={SocialDevClubPeopleImage} alt="Social Dev Club People" />
    </Style.Container>
  );
};

export default SocialDevClubSection;
