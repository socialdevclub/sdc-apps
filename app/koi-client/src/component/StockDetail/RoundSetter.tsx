import React from 'react';
import { Query } from '../../hook';

interface Props {
  stockId: string;
}

const RoundSetter = ({ stockId }: Props) => {
  const { data: game } = Query.Stock.useQueryStock(stockId);
  const { mutateAsync: mutateUpdateGame } = Query.Stock.useUpdateStock();

  if (!game) return <></>;

  return (
    <>
      <>현재 라운드</>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            round: game.round - 1,
          });
        }}
      >
        -1
      </button>
      <>{game.round}</>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            round: game.round + 1,
          });
        }}
      >
        +1
      </button>
    </>
  );
};

export default RoundSetter;
