import { UserOutlined } from '@ant-design/icons';
import { Avatar, List, Modal } from 'antd';
import { ReactElement, cloneElement, useReducer } from 'react';
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
        <List
          itemLayout="horizontal"
          dataSource={partnerNicknames}
          renderItem={(name) => (
            <List.Item>
              <List.Item.Meta avatar={<Avatar icon={<UserOutlined />} />} title={name} />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default RecommendedPartnersModal;
