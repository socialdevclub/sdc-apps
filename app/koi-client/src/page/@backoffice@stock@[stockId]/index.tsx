import React from 'react';
import { useParams } from 'react-router-dom';
import StockDetail from '../../component/StockDetail';

const BackofficeStockDetail = () => {
  const { stockId } = useParams();

  if (!stockId) return <div>stockId가 없습니다.</div>;

  return <StockDetail stockId={stockId} />;
};

export default BackofficeStockDetail;
