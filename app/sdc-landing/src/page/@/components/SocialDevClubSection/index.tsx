import { Style } from './index.style';

const SocialDevClubSection = () => {
  return (
    <Style.Container>
      <Style.BackgroundImage>
        <Style.Title>Social Dev Club</Style.Title>
        <Style.Subtitle>가짜오타쿠들이 모여 예술혼 터뜨리는</Style.Subtitle>
        <Style.Highlight>
          소셜게임 창작 커뮤니티, <Style.HighlightSpan>소셜데브클럽</Style.HighlightSpan>
        </Style.Highlight>
      </Style.BackgroundImage>
      <Style.Image src="/assets/img/SocialDevClubImage.png" alt="Social Dev Club People" />
    </Style.Container>
  );
};

export default SocialDevClubSection;
