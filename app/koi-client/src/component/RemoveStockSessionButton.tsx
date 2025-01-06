import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from 'lib-react-query';
import { Query } from '../hook';
import { serverApiUrl } from '../config/baseUrl';

interface RemoveStockSessionButtonProps {
  stockId: string;
}

const RemoveStockSessionButton: React.FC<RemoveStockSessionButtonProps> = ({ stockId }) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = Query.Stock.useRemoveStockSession(stockId);

  return (
    <button
      onClick={() => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
          mutateAsync({});
          queryClient.invalidateQueries(
            getQueryKey({
              hostname: serverApiUrl,
              method: 'GET',
              pathname: '/party',
            }),
          );
        }
      }}
    >
      🗑️
    </button>
  );
};

export default RemoveStockSessionButton;
