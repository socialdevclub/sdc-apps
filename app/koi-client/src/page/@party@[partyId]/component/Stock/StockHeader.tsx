import { Button } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import RecommendedPartnersModal from './component/Stock/RecommendedPartnersModal';
import { Query } from '../../../../hook';

interface Props {
  stockId: string;
}

const StockHeader = ({ stockId }: Props) => {
  const { data: stock } = Query.Stock.useQueryStock(stockId);

  if (stock?.stockPhase !== 'PLAYING') {
    return <></>;
  }

  return (
    <RecommendedPartnersModal
      stockId={stockId}
      trigger={
        <Button
          shape="circle"
          icon={<BulbOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
        />
      }
    />
  );
};

export default StockHeader;
