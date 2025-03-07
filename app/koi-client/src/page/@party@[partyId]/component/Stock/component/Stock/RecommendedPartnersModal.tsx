import { Modal } from 'antd';
import { ReactElement, cloneElement, useReducer } from 'react';
import styled from '@emotion/styled';
import { useRecommendedPartners } from '../../../../../../hook/query/Stock/useRecommendedPartners';

interface ButtonProps {
  onClick?: () => void;
}

interface Props {
  trigger: ReactElement<ButtonProps>;
  stockId: string | undefined;
}

const RecommendedPartnersModal = ({ trigger, stockId }: Props) => {
  const [isRecommendModalOpen, toggleRecommendModalOpen] = useReducer((state) => !state, false);
  const { partnerNicknames } = useRecommendedPartners(stockId);

  return (
    <>
      {cloneElement(trigger, { onClick: toggleRecommendModalOpen })}

      <Modal
        title="추천 대화상대"
        open={isRecommendModalOpen}
        onCancel={toggleRecommendModalOpen}
        centered
        footer={null}
      >
        <p>흥미로운 대화 상대를 발견했어요 ✨</p>
        <PartnerList>
          {partnerNicknames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </PartnerList>
      </Modal>
    </>
  );
};

export default RecommendedPartnersModal;

const PartnerList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  font-size: 16px;

  li {
    margin: 8px 0;
  }
`;
