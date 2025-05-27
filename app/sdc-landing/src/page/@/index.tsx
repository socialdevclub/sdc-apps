import styled from '@emotion/styled';
import { HeroBanner, LineBanner, OurGoalSection, SignatureGameSection } from './components';
import HowWePlaySection from './components/HowWePlaySection';
import SocialDevClubSection from './components/SocialDevClubSection';

const Home = () => {
  return (
    <Container>
      <div>
        <HeroBanner />
        <LineBanner />
      </div>
      <OurGoalSection />
      <SocialDevClubSection />
      <HowWePlaySection />
      <SignatureGameSection />
    </Container>
  );
};

const Container = styled.div`
  background-color: #000000;
  min-height: 100dvh;
  gap: 100px;
  display: flex;
  flex-direction: column;
`;

export default Home;
