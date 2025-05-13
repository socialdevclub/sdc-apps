import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Avatar } from 'antd';
import { useRecommendedPartners } from '../../../../../../hook/query/Stock/useRecommendedPartners';

interface Props {
  stockId: string;
}

const RecommendedPartners = ({ stockId }: Props) => {
  const { partnerNicknames, isLoading, refetch } = useRecommendedPartners(stockId);

  useEffect(() => {
    // Todo:: 쿼리 초기 요청에 데이터가 나오지 않는 상황이 있습니다. 추후 원인 파악 및 해결이 필요합니다.
    refetch();
  }, [refetch]);

  if (!isLoading && partnerNicknames.length === 0) {
    return (
      <Container>
        <PartnersTitle>추천 대화 상대</PartnersTitle>
        <PartnersDescription>일부 정보를 공유하는 대화 상대를 발견하지 못했어요 😢</PartnersDescription>
      </Container>
    );
  }

  return (
    <Container>
      <PartnersTitle>추천 대화 상대</PartnersTitle>
      <PartnersDescription>일부 정보를 공유하는 대화 상대를 발견했어요 👀</PartnersDescription>

      <PartnersList>
        {partnerNicknames?.map((nickname) => (
          <PartnerItem key={nickname}>
            <Avatar size={40} style={{ border: '1px solid #c6c6c6' }}>
              {nickname?.[0]}
            </Avatar>
            <PartnerNickname>{nickname}</PartnerNickname>
          </PartnerItem>
        ))}
        <PartnerItem>
          <Avatar size={40} style={{ border: '1px solid #c6c6c6' }}>
            테
          </Avatar>
          <PartnerNickname>테스트</PartnerNickname>
        </PartnerItem>
      </PartnersList>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const PartnersTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  margin-top: 20px;
`;

const PartnersDescription = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

const PartnersList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0;
  margin: 20px 0 0 0;
`;

const PartnerItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PartnerNickname = styled.span`
  font-size: 18px;
  color: #c6c6c6;
`;

export default RecommendedPartners;
