import { useEffect, useRef } from 'react';
import { MessageInstance } from 'antd/es/message/interface';
import { StockStorageSchema } from 'shared~type-stock';
import { Query } from '../../../hook';

interface Props {
  stockStorages: StockStorageSchema[];
  messageApi: MessageInstance;
}

interface ReturnType {
  onClickBuy: (props: BuyStockProps) => Promise<void>;
  onClickSell: (props: SellStockProps) => Promise<void>;
  isBuyLoading: boolean;
  isSellLoading: boolean;
}

interface BuyStockProps {
  amount: number;
  company: string;
  round: number;
  stockId: string;
  unitPrice: number;
  userId: string;
  callback?: () => void;
}

interface SellStockProps {
  amount: number;
  company: string;
  round: number;
  stockId: string;
  unitPrice: number;
  userId: string;
  callback?: () => void;
}

/**
 * 주식 거래 (구매, 판매) 로직을 담당하고,
 * 서버에서 성공/실패를 확인하기 어려운 비동기 메시지 큐로 인해 구매/판매 토스트 메시지 표시를 위한 커스텀 훅
 * @param stockStorages 현재 내가 가진 주식들에 대한 정보
 * @param messageApi 메시지 API
 */
export const useTradeStock = ({ stockStorages, messageApi }: Props): ReturnType => {
  const prevStockStorages = useRef<StockStorageSchema[]>(stockStorages);

  const { mutateAsync: buyStock, isLoading: isBuyLoading } = Query.Stock.useBuyStock();
  const { mutateAsync: sellStock, isLoading: isSellLoading } = Query.Stock.useSellStock();

  const onClickBuy = async ({
    amount,
    company,
    round,
    stockId,
    unitPrice,
    userId,
    callback,
  }: BuyStockProps): Promise<void> => {
    await buyStock({ amount, company, round, stockId, unitPrice, userId });
    callback?.();
  };

  const onClickSell = async ({
    amount,
    company,
    round,
    stockId,
    unitPrice,
    userId,
    callback,
  }: SellStockProps): Promise<void> => {
    await sellStock({ amount, company, round, stockId, unitPrice, userId });
    callback?.();
  };

  //   비동기 메시지 큐(SQS)로 인한 구매/판매 성공에 대한 메시지 표시 기능
  useEffect(() => {
    if (stockStorages.length > 0 && prevStockStorages.current.length > 0) {
      const currentTotalStocks = stockStorages.reduce((total, storage) => total + (storage.stockCountCurrent || 0), 0);

      const prevTotalStocks = prevStockStorages.current.reduce(
        (total, storage) => total + (storage.stockCountCurrent || 0),
        0,
      );

      if (currentTotalStocks > prevTotalStocks) {
        messageApi.destroy();
        messageApi.open({
          content: `주식을 ${currentTotalStocks - prevTotalStocks}주 구매하였습니다.`,
          duration: 2,
          type: 'success',
        });
      } else if (currentTotalStocks < prevTotalStocks) {
        messageApi.destroy();
        messageApi.open({
          content: `주식을 ${prevTotalStocks - currentTotalStocks}주 판매하였습니다.`,
          duration: 2,
          type: 'success',
        });
      }

      prevStockStorages.current = stockStorages;
    }
  }, [messageApi, stockStorages]);

  return { isBuyLoading, isSellLoading, onClickBuy, onClickSell };
};
