import { Button } from 'antd';
import React from 'react';
import { Query } from '../../../hook';

const StockCreateForm = () => {
  const { mutateAsync } = Query.Stock.useCreateStock();
  const { refetch } = Query.Stock.useQueryStockList();

  return (
    <Button
      onClick={async () => {
        await mutateAsync({});
        refetch();
      }}
    >
      주식게임 세션 생성
    </Button>
  );
};

export default StockCreateForm;
