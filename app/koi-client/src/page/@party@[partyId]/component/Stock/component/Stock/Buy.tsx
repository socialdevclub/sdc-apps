import { objectEntries } from '@toss/utils';
import { useAtomValue } from 'jotai';
import { Button, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import Box from '../../../../../../component-presentation/Box';

interface Props {
  stockId: string;
}

const Buy = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, companiesPrice, timeIdx } = Query.Stock.useQueryStock(stockId);
  const { isFreezed } = Query.Stock.useUser({ stockId, userId });

  const { mutateAsync: buyStock, isLoading } = Query.Stock.useBuyStock();

  const [messageApi, contextHolder] = message.useMessage();

  if (!stock || !userId) {
    return <>불러오는 중</>;
  }

  const onClickBuy = (company: string) => {
    buyStock({ amount: 1, company, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.open({
          content: '주식을 구매하였습니다.',
          duration: 2,
          type: 'success',
        });
      })
      .catch((reason: Error) => {
        messageApi.open({
          content: `${reason.message}`,
          duration: 2,
          type: 'error',
        });
      });
  };

  const isDisabled = timeIdx === undefined || timeIdx >= 9 || !stock.isTransaction;

  return (
    <>
      {contextHolder}
      {objectEntries(stock.remainingStocks).map(([company, count]) => {
        return (
          <Box
            key={company}
            value={company}
            rightComponent={
              <Button
                icon={<ShoppingCartOutlined />}
                disabled={count === 0 || isDisabled}
                loading={isLoading || isFreezed}
                onClick={() => {
                  onClickBuy(company);
                }}
              >
                사기
              </Button>
            }
          />
        );
      })}
    </>
  );
};

export default Buy;
