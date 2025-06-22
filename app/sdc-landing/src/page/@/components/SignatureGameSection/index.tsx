import { useMediaQuery } from 'react-responsive';
import * as styles from './index.style';
import { MEDIA_QUERY } from '../../../../config/common';

export type ProjectStatus = 'OPEN' | 'COMING_SOON' | 'IN_DEVELOPMENT';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  COMING_SOON: '오픈임박',
  IN_DEVELOPMENT: '개발중',
  OPEN: '운영중',
};

const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  COMING_SOON: '#FFD312',
  IN_DEVELOPMENT: '#BCBCBC',
  OPEN: '#06DEDD',
};

const cards: { name: string; description: string; status: ProjectStatus; url: string }[] = [
  {
    description: `거짓말쟁이를 피해서 주식 정보를 교환해요.\n변동하는 시장가에서 주식으로 돈을 벌고\n 부자가 되어보세요!`,
    name: '주식 게임',
    status: 'OPEN',
    url: 'src/assets/img/GameImageStock.png',
  },
  {
    description: `한 번의 터치로 순식간에 퍼지는 좀비 바이러스!\n끝없이 번지는 바이러스 속에서 마지막까지\n 인간성을 지켜낼 사람은 과연 누구?!`,
    name: '좀비게임',
    status: 'COMING_SOON',
    url: 'src/assets/img/GameImageZombies.png',
  },
  {
    description: '소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요',
    name: '마피아시즈',
    status: 'IN_DEVELOPMENT',
    url: 'src/assets/img/GameImageMafia.png',
  },
  {
    description: '추리하고, 의심해라!\n치밀한 판단력과 심리전으로 사건의 진실을\n쟁탈하는 미스터리 게임',
    name: '미스터리 크레딧',
    status: 'IN_DEVELOPMENT',
    url: 'src/assets/img/GameImageMysteryCredits.png',
  },
  {
    description:
      '단서도, 증거도 오직 채팅뿐!\n누구의 말이 진실이고, 거짓말일까?\n대화를 통해 진실을 파헤치고, 미션을 완수하라!',
    name: '챗몽어스',
    status: 'IN_DEVELOPMENT',
    url: 'src/assets/img/GameImageChat.png',
  },
  {
    description:
      '바다에 아군은 없다. 협력은 위장, 배신은 전략!\n보물을 차지할 단 하나의 팀이 되기 위해,\n지금 판을 뒤흔들고 살아남아라!',
    name: '대항해',
    status: 'IN_DEVELOPMENT',
    url: 'src/assets/img/GameImageDiscovery.png',
  },
];

export const SignatureGameSection = () => {
  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });

  return (
    <styles.Container>
      <styles.Title>Signature Game</styles.Title>
      <styles.Description
        text={
          isDesktop
            ? '소셜데브클럽에서 만들고 있는 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요'
            : '소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요'
        }
        highlights={[
          {
            color: '#06DEDD',
            text: '시그니처 게임!',
          },
          {
            color: '#AE94FF',
            text: '기여하고 함께 성장',
          },
        ]}
      />
      <styles.CardContainer>
        {cards.map((card) => (
          <styles.Card key={card.name}>
            <styles.Card.Content>
              <styles.Card.Badge color={PROJECT_STATUS_COLORS[card.status]}>
                {PROJECT_STATUS_LABELS[card.status]}
              </styles.Card.Badge>
              <styles.Card.Image src={card.url} alt={card.name} />
            </styles.Card.Content>
            <styles.Card.TextBox>
              <styles.Card.Title>{card.name}</styles.Card.Title>
              <styles.Card.Text>{card.description}</styles.Card.Text>
            </styles.Card.TextBox>
          </styles.Card>
        ))}
      </styles.CardContainer>
      {/* <styles.MoreButton>더보기</styles.MoreButton> */}
    </styles.Container>
  );
};
