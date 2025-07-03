import * as styles from './index.styles';

const imageUrls = [
  {
    highlights: ['게임 개발'],
    text: '독창적인 게임 개발',
    url: '/assets/img/Gamepad.png',
  },
  {
    highlights: ['게임 콘텐츠 설계'],
    text: '누구나 즐길 수 있는\n게임 콘텐츠 설계',
    url: '/assets/img/Confetti.png',
  },
  // {
  //   highlights: ['브랜드 협업'],
  //   text: '다양한 인플루언서와\n브랜드 협업',
  //   url: 'src/assets/img/Chat.png',
  // },
  {
    highlights: ['양방향 네트워킹'],
    text: '사람과 사람을 연결하는\n양방향 네트워킹',
    url: '/assets/img/Chain.png',
  },
];

export const OurGoalSection = () => {
  return (
    <styles.Container>
      <styles.Title>Our Goal</styles.Title>
      <styles.Description
        text={`모두가 즐길 수 있는 체험형 게임을 개발하여\n사람과 사람을 연결하고, 이색적인 콘텐츠 경험을 설계해요`}
        highlights={['체험형 게임', '사람과 사람을 연결', '이색적인 콘텐츠 경험']}
      />
      <styles.CardWrapper>
        {imageUrls.map((imageUrl) => (
          <styles.Card key={imageUrl.url}>
            <styles.CardImage src={imageUrl.url} alt={imageUrl.text} />
            <styles.CardText text={imageUrl.text} highlights={imageUrl.highlights} />
          </styles.Card>
        ))}
      </styles.CardWrapper>
    </styles.Container>
  );
};
