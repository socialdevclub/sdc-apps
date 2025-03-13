import { Avatar } from 'antd';
import styled from '@emotion/styled';
import { ImpressionArea } from '@toss/impression-area';
import { useRecommendedPartners } from '../../../../../../hook/query/Stock/useRecommendedPartners';
import * as COLOR from '../../../../../../config/color';

interface Props {
  stockId: string | undefined;
}

const RecommendedPartnersModalContent = ({ stockId }: Props) => {
  const { partnerNicknames, refetch } = useRecommendedPartners(stockId);

  return (
    <ImpressionArea
      onImpressionStart={() => {
        console.log('refetch');
        refetch();
      }}
    >
      {!partnerNicknames ? (
        <PartnerDescription>라고 할 뻔.. 사실 발견 못했어요 😢</PartnerDescription>
      ) : (
        <PartnerList>
          {partnerNicknames.map((name) => (
            <PartnerItem key={name}>
              <Avatar size={40}>{name?.[0]}</Avatar>
              <span>{name}</span>
            </PartnerItem>
          ))}
        </PartnerList>
      )}
    </ImpressionArea>
  );
};

export default RecommendedPartnersModalContent;

const PartnerDescription = styled.p`
  font-size: 12px;
  color: #9ca3af;

  & > span {
    color: ${COLOR.pastelGreen};
  }
`;

const PartnerList = styled.ul`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  color: rgb(213, 213, 213);
  padding-left: 0px;
  font-size: 17px;
`;

const PartnerItem = styled.li`
  background-color: #2a2d3a;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  align-items: center;
  column-gap: 16px;
`;
