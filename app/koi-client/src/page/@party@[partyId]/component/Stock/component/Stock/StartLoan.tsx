import React, { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Button, Modal, message } from 'antd';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';

type Props = {
  stockId: string;
};

const StartLoan = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { user } = Query.Stock.useUser({ stockId, userId });
  const { mutateAsync: startLoan, isLoading } = Query.Stock.useStartLoan();
  const { allSellPrice } = Query.Stock.useAllSellPrice({ stockId, userId });

  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { data: stock, timeIdx } = Query.Stock.useQueryStock(stockId);

  const onClickStartLoan = () => {
    if (!userId) return;
    startLoan({
      stockId,
      userId,
    })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: '뽑기에 성공하였습니다',
          duration: 2,
          type: 'success',
        });
        setOpen(false);
      })
      .catch((reason: Error) => {
        messageApi.destroy();
        messageApi.open({
          content: `${reason.message}`,
          duration: 2,
          type: 'error',
        });
      });
  };

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!stock || !userId) {
    return <>불러오는 중</>;
  }

  const allPrice = allSellPrice + (user?.money ?? 0);
  const isDisabled = timeIdx === undefined || timeIdx >= 7 || !stock.isTransaction || allPrice < 1000000;

  return (
    <>
      {contextHolder}
      <Button size="small" onClick={() => setOpen(true)} disabled={isDisabled}>
        대출하기
      </Button>
      <div
        css={{
          position: 'absolute',
        }}
      >
        <Modal
          title="대출하기"
          open={open}
          onCancel={() => setOpen(false)}
          okText="대출하기"
          cancelText="닫기"
          getContainer={false}
          okButtonProps={{ loading: isLoading }}
          onOk={onClickStartLoan}
        >
          <div ref={modalRef} tabIndex={-1}>
            <p>1회 대출시 100만원을 받을 수 있어요</p>
            <p>[매수 가능 금액]이나 [매수 가능 금액 + 주식가치]의 합이 100만원 이상일 경우 대출을 받을 수 없어요</p>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default StartLoan;
