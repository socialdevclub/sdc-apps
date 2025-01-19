import { Style } from './index.style';

const Home = () => {
  return (
    <Style.Container>
      <Style.Header>
        <Style.Title>소셜데브클럽</Style.Title>
        <Style.Subtitle>게임을 통해 사람들과 연결되고 함께 성장하는 특별한 경험을 제공합니다.</Style.Subtitle>
        <Style.Button onClick={() => window.open('https://discord.gg/H8sq77NabR', '_blank')}>
          디스코드로 가입하기
        </Style.Button>
      </Style.Header>
    </Style.Container>
  );
};

export default Home;
