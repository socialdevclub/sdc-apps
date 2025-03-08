import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Modal, message } from 'antd';
import styled from '@emotion/styled';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import * as COLOR from '../../../../../../config/color';

type Props = {
  stockId: string;
};

const StartLoan = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { mutateAsync: startLoan, isLoading } = Query.Stock.useStartLoan();

  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLUListElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { data: stock, timeIdx } = Query.Stock.useQueryStock(stockId);

  const onClickStartLoan = () => {
    if (!userId) return;
    startLoan({
      stockId,
      userId,
    })
      .then((res) => {
        messageApi.destroy();
        messageApi.open({
          content: res.message,
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

  const isDisabled = timeIdx === undefined || !stock.isTransaction;

  return (
    <>
      {contextHolder}
      <LoanButton onClick={() => setOpen(true)} disabled={isDisabled}>
        대출하기
      </LoanButton>
      <div
        css={{
          position: 'absolute',
        }}
      >
        <Modal
          title="대출하기"
          open={open}
          centered
          onCancel={() => setOpen(false)}
          okText="대출하기"
          cancelText="닫기"
          getContainer={false}
          cancelButtonProps={{ style: { backgroundColor: '#252836', color: 'white' } }}
          okButtonProps={{
            loading: isLoading,
            style: { backgroundColor: COLOR.violetLight },
          }}
          onOk={onClickStartLoan}
        >
          <LoanRulesList ref={modalRef} tabIndex={-1}>
            <li>
              <h3>1. 대출 금액</h3>
              <p>
                1회 대출시 <HighlightedText>100만원</HighlightedText>을 받을 수 있어요
              </p>
            </li>
            <li>
              <h3>2. 대출 가능 조건</h3>
              <p>
                [매수 가능 금액]이나 [매수 가능 금액 + 주식가치]의 <HighlightedText>합</HighlightedText>이 100만원
                이상일 경우 대출을 받을 수 없어요
              </p>
            </li>
            <li>
              <h3>3. 상환 조건</h3>
              <p>
                게임이 종료되면 <HighlightedText>[대출 횟수 * 200만원]</HighlightedText> 만큼 회수를 해요
              </p>
            </li>
          </LoanRulesList>
        </Modal>
      </div>
    </>
  );
};

const LoanRulesList = styled.ul`
  list-style: none;
  font-size: 12px;
  color: #9ca3af;
  padding: 3px 0;

  & > li > h3 {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.8);
  }
`;
const HighlightedText = styled.span`
  color: ${COLOR.pastelGreen};
`;

const LoanButton = styled.button`
  width: 100%;
  font-family: 'DungGeunMo';
  padding: 16px;
  height: 56px;
  border-radius: 4px;
  background-color: ${COLOR.violetLight};
  color: white;
  font-size: 14px;
  border: none;
  &:hover > span {
    color: white;
  }
  &:disabled {
    opacity: 50%;
    cursor: not-allowed;
  }
`;

export default StartLoan;
