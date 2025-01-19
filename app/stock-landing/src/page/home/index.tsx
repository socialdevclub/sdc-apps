import { Style } from './index.style';

const Home = () => {
  return (
    <Style.Container>
      <Style.Header>
        <Style.Title>소셜데브클럽</Style.Title>
        <Style.Subtitle>사람과 사람을 연결시켜주는 소셜 게임을 함께 만들고 즐겨요 👾</Style.Subtitle>
        <Style.Button onClick={() => window.open('https://discord.gg/H8sq77NabR', '_blank')}>
          디스코드 입장하기
        </Style.Button>
      </Style.Header>
    </Style.Container>
  );
};

export default Home;
