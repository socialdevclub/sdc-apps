import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Modal, message } from 'antd';
import styled from '@emotion/styled';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import * as COLOR from '../../../../../../config/color';

type Props = {
  stockId: string;
  loanCount: number;
  money: number;
  allSellPrice: number;
};

const StartLoan = ({ stockId, loanCount, money, allSellPrice }: Props) => {
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

  // 매수 가능 금액과 주식 가치 계산
  const availableMoney = money;
  const totalAssets = availableMoney + allSellPrice;

  // 대출 가능 여부 메시지 생성
  const getLoanStatusInfo = () => {
    if (availableMoney >= 1000000) {
      return {
        message: `현재 매수 가능 금액이 ${availableMoney.toLocaleString()}원으로, 이미 100만원 이상입니다.`,
        status: '대출 불가능',
        statusColor: '#c22e08',
      };
    }
    if (totalAssets >= 1000000) {
      return {
        message: `매수 가능 금액(${availableMoney.toLocaleString()}원)과 주식가치(${allSellPrice.toLocaleString()}원)의 합이 ${totalAssets.toLocaleString()}원으로, 100만원을 초과합니다.`,
        status: '대출 불가능',
        statusColor: '#c22e08',
      };
    }
    return {
      message: `매수 가능 금액(${availableMoney.toLocaleString()}원)과 주식가치(${allSellPrice.toLocaleString()}원)의 합이 ${totalAssets.toLocaleString()}원으로, 100만원 미만입니다.`,
      status: '대출 가능',
      statusColor: '#166f35',
    };
  };

  // 상환 정보 생성
  const getRepaymentInfo = () => {
    if (loanCount === 0) {
      return {
        message: '지금까지 대출을 받지 않아 게임 종료 시 회수할 금액이 없습니다.',
        status: '상환 없음',
        statusColor: '#166f35',
      };
    }
    return {
      // 노란색으로 경고
      message: `지금까지 대출을 ${loanCount}번 받아 게임 종료 시 ${loanCount * 200}만원을 회수할 예정입니다.`,

      status: `${loanCount * 200}만원 상환 예정`,
      statusColor: '#7c5e11',
    };
  };

  const loanStatus = getLoanStatusInfo();
  const repaymentInfo = getRepaymentInfo();

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
        <StyledModal
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
          <ScrollContainer>
            <LoanRulesList ref={modalRef} tabIndex={-1}>
              <li>
                <RuleTitle>1. 대출 금액</RuleTitle>
                <RuleDescription>
                  1회 대출시 <HighlightedText>100만원</HighlightedText>을 받을 수 있어요
                </RuleDescription>
                <StatusCard>
                  <InfoRow>
                    <InfoLabel>현재 금액</InfoLabel>
                    <InfoValue>{availableMoney.toLocaleString()}원</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>대출 후 금액</InfoLabel>
                    <InfoValue color="#4caf50" highlight>
                      {(availableMoney + 1000000).toLocaleString()}원
                    </InfoValue>
                  </InfoRow>
                </StatusCard>
              </li>
              <li>
                <RuleTitle>2. 대출 가능 조건</RuleTitle>
                <RuleDescription>
                  [매수 가능 금액]이나 [매수 가능 금액 + 주식가치]의 <HighlightedText>합</HighlightedText>이 100만원
                  이상일 경우 대출을 받을 수 없어요
                </RuleDescription>
                <StatusCard>
                  <StatusHeader>
                    <StatusBadge color={loanStatus.statusColor}>{loanStatus.status}</StatusBadge>
                    <StatusMessage color={loanStatus.statusColor === '#166f35' ? '#a3e9b4' : '#ffb8a8'}>
                      {loanStatus.message}
                    </StatusMessage>
                  </StatusHeader>
                  <InfoTable>
                    <InfoRow>
                      <InfoLabel>매수 가능 금액</InfoLabel>
                      <InfoValue>{availableMoney.toLocaleString()}원</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>주식가치</InfoLabel>
                      <InfoValue>{allSellPrice.toLocaleString()}원</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>합계</InfoLabel>
                      <InfoValue color={totalAssets >= 1000000 ? '#ff6347' : '#4caf50'}>
                        {totalAssets.toLocaleString()}원
                      </InfoValue>
                    </InfoRow>
                  </InfoTable>
                </StatusCard>
              </li>
              <li>
                <RuleTitle>3. 상환 조건</RuleTitle>
                <RuleDescription>
                  게임이 종료되면 <HighlightedText>[대출 횟수 * 200만원]</HighlightedText> 만큼 회수를 해요
                </RuleDescription>
                <StatusCard>
                  <StatusHeader>
                    <StatusBadge color={repaymentInfo.statusColor}>{repaymentInfo.status}</StatusBadge>
                    <StatusMessage color={repaymentInfo.statusColor === '#166f35' ? '#a3e9b4' : '#ffe0a3'}>
                      {repaymentInfo.message}
                    </StatusMessage>
                  </StatusHeader>
                  <InfoTable>
                    <InfoRow>
                      <InfoLabel>대출 횟수</InfoLabel>
                      <InfoValue>{loanCount}회</InfoValue>
                    </InfoRow>
                    {loanCount > 0 && (
                      <InfoRow>
                        <InfoLabel>예상 상환 금액</InfoLabel>
                        <InfoValue color="#ff6347">{(loanCount * 200).toLocaleString()}만원</InfoValue>
                      </InfoRow>
                    )}
                  </InfoTable>
                </StatusCard>
              </li>
            </LoanRulesList>
          </ScrollContainer>
        </StyledModal>
      </div>
    </>
  );
};

// 스타일된 모달 컴포넌트
const StyledModal = styled(Modal)`
  .ant-modal-body {
    height: 70dvh;
  }
`;

// 스크롤 가능한 컨테이너
const ScrollContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #1f2028;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a3e4c;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #4d5060;
  }
`;

const LoanRulesList = styled.ul`
  list-style: none;
  font-size: 12px;
  padding: 3px 0;
  margin: 0;

  & > li {
    margin-bottom: 20px;
  }

  & > li:last-child {
    margin-bottom: 4px;
  }
`;

const RuleTitle = styled.h3`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
  font-weight: 600;
`;

const RuleDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 10px;
`;

const HighlightedText = styled.span`
  color: ${COLOR.pastelGreen};
  font-weight: 600;
`;

const StatusCard = styled.div`
  background-color: #2a2d3a;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 2px;
`;

const StatusMessage = styled.p<{ color: string }>`
  margin: 0;
  font-size: 10px;
  color: ${(props) => props.color};
  flex: 1;
  line-height: 1.5;
`;

const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #3a3e4c;
  padding-top: 10px;
  margin-top: 2px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.span`
  color: #9ca3af;
  font-size: 11px;
`;

const InfoValue = styled.span<{ highlight?: boolean; color?: string }>`
  font-size: 12px;
  font-weight: ${(props) => (props.highlight ? 'bold' : 'normal')};
  color: ${(props) => (props.color ? props.color : props.highlight ? COLOR.pastelGreen : 'white')};
`;

const StatusBadge = styled.div<{ color: string }>`
  background-color: ${(props) => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  display: inline-block;
  white-space: nowrap;
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
