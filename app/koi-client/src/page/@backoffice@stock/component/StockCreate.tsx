import { Button } from 'antd';
import React from 'react';
import { Query } from '../../../hook';

const StockCreateForm = () => {
  const { mutateAsync } = Query.Stock.useCreateStock();

  return (
    <Button
      onClick={async () => {
        await mutateAsync({});
      }}
    >
      주식게임 세션 생성
    </Button>
  );
};

export default StockCreateForm;
