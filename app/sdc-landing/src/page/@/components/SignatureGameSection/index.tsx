import * as styles from './index.style';

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
    description:
      '짱친들이 들고있는 주식 정보를 서로 공유해요. 거짓말쟁이를 피해서 주식으로 돈을 벌고 부자가 되어보아요!',
    name: '주식 게임',
    status: 'OPEN',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    description:
      '소셜데브클럽의 시그니처 게임소셜데브클럽의 시그니처 게임소셜데브클럽의 시그니처 게임소셜데브클럽의 시그니처 게임소셜데브클럽의 시그니처 게임소셜데브클럽의 시그니처 게임소셜데브클럽의 시그니처 게임소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요',
    name: '소셜데브클럽',
    status: 'COMING_SOON',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    description: '소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요',
    name: '소셜데브클럽',
    status: 'IN_DEVELOPMENT',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    description: '소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요',
    name: '소셜데브클럽',
    status: 'IN_DEVELOPMENT',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    description: '소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요',
    name: '소셜데브클럽',
    status: 'IN_DEVELOPMENT',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    description: '소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요',
    name: '소셜데브클럽',
    status: 'IN_DEVELOPMENT',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
];

export const SignatureGameSection = () => {
  return (
    <styles.Container>
      <styles.Title>Signature Game</styles.Title>
      <styles.Description
        text={`소셜데브클럽의 시그니처 게임!\n커뮤니티에 기여하고 함께 성장해요`}
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
      <styles.MoreButton>더보기</styles.MoreButton>
    </styles.Container>
  );
};
