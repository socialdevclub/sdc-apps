import DiscordIcon from '@assets/icon/discord-white.svg';
import RightArrowIcon from '@assets/icon/right-arrow.svg';
import { Style } from './index.style';

const DISCORD_INVITE_LINK = 'https://discord.gg/H8sq77NabR';

const Home = () => {
  return (
    <Style.Container>
      <Style.Title>소셜데브클럽</Style.Title>
      <Style.Subtitle>
        사람과 사람을 연결시켜주는 <span>소셜 게임을 함께 만들고 즐겨요 👾</span>
      </Style.Subtitle>
      <Style.Button onClick={() => window.open(DISCORD_INVITE_LINK, '_blank')}>
        <img src={DiscordIcon} alt="Discord Icon" width="24" height="24" />
        <span>디스코드 입장하기</span>
        <img src={RightArrowIcon} alt="Right Arrow Icon" width="24" height="24" />
      </Style.Button>
    </Style.Container>
  );
};

export default Home;
