import styled from '@emotion/styled';
import { HeroBanner, LineBanner, OurGoalSection, SignatureGameSection } from './components';
import HowWePlaySection from './components/HowWePlaySection';
import SocialDevClubSection from './components/SocialDevClubSection';

const Home = () => {
  return (
    <Container>
      <BannerWrapper>
        <HeroBanner />
        <LineBanner />
      </BannerWrapper>
      <SocialDevClubSection />
      <OurGoalSection />
      <HowWePlaySection />
      <SignatureGameSection />
    </Container>
  );
};

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: -100px;
  min-height: calc(100svh - 72px);
`;

const Container = styled.div`
  background-color: #000000;
  min-height: 100dvh;
  gap: 400px;
  display: flex;
  flex-direction: column;
`;

export default Home;
