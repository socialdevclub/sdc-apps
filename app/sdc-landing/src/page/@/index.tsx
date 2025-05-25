import styled from '@emotion/styled';
import { BigBanner, StripBanner } from './components';

const Home = () => {
  return (
    <Container>
      <BigBanner />
      <StripBanner />
    </Container>
  );
};

const Container = styled.div`
  background-color: #000000;
  min-height: 100dvh;
`;

export default Home;
