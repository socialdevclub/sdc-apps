import styled from '@emotion/styled';
import { HeroBanner, LineBanner, OurGoalSection, SignatureGameSection } from './components';
import HowWePlaySection from './components/HowWePlaySection';
import SocialDevClubSection from './components/SocialDevClubSection';
import { applyResponsiveStyles } from '../../utils/styles';

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

const BannerWrapper = styled.div(
  applyResponsiveStyles({
    DESKTOP: {
      marginBottom: '-100px',
      minHeight: 'calc(100svh - 96px)',
    },
    base: {
      display: 'flex',
      flexDirection: 'column',
      gap: '100px',
      height: '100%',
      justifyContent: 'space-between',
      marginBottom: 0,
      minHeight: 'calc(100svh - 76px)',
    },
  }),
);

const Container = styled.div(
  applyResponsiveStyles({
    DESKTOP: {
      gap: '400px',
    },
    base: {
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      gap: '100px',
      minHeight: '100dvh',
    },
  }),
);

export default Home;
