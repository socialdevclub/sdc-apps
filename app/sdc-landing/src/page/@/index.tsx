import styled from '@emotion/styled';
import { BigBanner, LineBanner, OurGoalSection, SignatureGameSection } from './components';

const Home = () => {
  return (
    <Container>
      <div>
        <BigBanner />
        <LineBanner />
      </div>
      <OurGoalSection />
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
