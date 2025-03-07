import { objectEntries } from '@toss/utils';
import { useAtomValue } from 'jotai';
import { Drawer, message } from 'antd';
import styled from '@emotion/styled';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as echarts from 'echarts';
import { useMediaQuery } from 'react-responsive';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import StockCard from './StockCard';

interface Props {
  stockId: string;
}

// constants
// COMPANY_NAMES

const Buy = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, companiesPrice, timeIdx } = Query.Stock.useQueryStock(stockId);
  const { isFreezed } = Query.Stock.useUser({ stockId, userId });

  const { mutateAsync: buyStock, isLoading: isBuyLoading } = Query.Stock.useBuyStock();
  const { mutateAsync: sellStock, isLoading: isSellLoading } = Query.Stock.useSellStock();
  const [messageApi, contextHolder] = message.useMessage();

  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  // Drawer 모바일 버전 렌더링 제어
  const isDesktop = useMediaQuery({ query: `(min-width: 800px)` });

  // 차트 DOM 요소 참조
  const chartRef = useRef<HTMLDivElement>(null);
  // echarts 인스턴스 참조
  const chartInstance = useRef<echarts.ECharts>();

  // 드래그 기능을 위한 ref와 상태 추가
  const drawerContentRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleCloseDrawer = useCallback(() => {
    setSelectedCompany('');
    setOpen(false);
  }, []);

  // 드래그 이벤트 핸들러
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !drawerContentRef.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        drawerContentRef.current.style.transform = `translateY(${deltaY}px)`;
        drawerContentRef.current.style.transition = 'none';
      }
    },
    [isDragging, startY],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !drawerContentRef.current) return;

    const translateY = drawerContentRef.current.style.transform;
    const match = translateY.match(/translateY\((\d+)px\)/);
    const deltaY = match ? parseInt(match[1], 10) : 0;

    if (deltaY > 100) {
      // 충분히 아래로 드래그했을 때 Drawer 닫기
      handleCloseDrawer();
    } else {
      // 원래 위치로 돌아가기
      drawerContentRef.current.style.transform = 'translateY(0)';
      drawerContentRef.current.style.transition = 'transform 0.3s';
    }

    setIsDragging(false);
  }, [isDragging, handleCloseDrawer]);

  // Drawer가 열릴 때 이벤트 리스너 등록
  useEffect(() => {
    if (open) {
      // Drawer가 열린 후 DOM 요소 참조 가져오기
      setTimeout(() => {
        const drawerContent = document.querySelector('.ant-drawer-content');
        const drawerHeader = document.querySelector('.ant-drawer-header');

        if (drawerContent && drawerHeader) {
          drawerContentRef.current = drawerContent as HTMLDivElement;

          // 헤더에만 드래그 이벤트 리스너 등록
          drawerHeader.addEventListener('touchstart', handleTouchStart as EventListener);
          document.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
          document.addEventListener('touchend', handleTouchEnd as EventListener);
        }
      }, 300);
    }

    return () => {
      // 이벤트 리스너 제거
      const drawerHeader = document.querySelector('.ant-drawer-header');
      if (drawerHeader) {
        drawerHeader.removeEventListener('touchstart', handleTouchStart as EventListener);
        document.removeEventListener('touchmove', handleTouchMove as EventListener);
        document.removeEventListener('touchend', handleTouchEnd as EventListener);
      }
    };
  }, [open, handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (!stock || !userId) {
    return <>불러오는 중</>;
  }

  const handleOpenDrawer = (company: string) => {
    setSelectedCompany(company);
    setOpen(true);
  };

  const onClickBuy = (company: string) => {
    buyStock({ amount: 1, company, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: '주식을 구매하였습니다.',
          duration: 2,
          type: 'success',
        });
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

  const onClickSell = (company: string) => {
    sellStock({ amount: 1, company, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: '주식을 판매하였습니다.',
          duration: 2,
          type: 'success',
        });
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

  const onClickSellAll = (company: string) => {
    sellStock({ amount: 1, company, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: '주식을 판매하였습니다.',
          duration: 2,
          type: 'success',
        });
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

  const isLoading = isBuyLoading || isFreezed || isSellLoading;
  const isDisabled = timeIdx === undefined || timeIdx >= 9 || !stock.isTransaction || isLoading;

  // console.log({ stock }, stock?.remainingStocks);
  // console.log({ companiesPrice });

  const handleAfterOpenChange = (visible: boolean) => {
    if (visible) {
      setTimeout(() => {
        if (chartRef.current && chartInstance.current && !chartInstance.current.isDisposed()) {
          chartInstance.current.resize();
        }
      }, 400);
    }
  };

  return (
    <>
      {contextHolder}
      {objectEntries(stock.remainingStocks).map(([company, count]) => (
        <StockCard
          key={company}
          company={company}
          quantity={count}
          onClick={() => handleOpenDrawer(company)}
          isActive={company === selectedCompany}
        />
      ))}
      <Drawer
        placement="bottom"
        onClose={handleCloseDrawer}
        open={open}
        height="auto"
        keyboard
        styles={{
          body: {
            padding: '6px 0 0 0',
          },
          content: {
            backgroundColor: '#252836',
            borderRadius: '16px 16px 0 0',
            height: 'auto',
            margin: '0 auto',
            maxWidth: isDesktop ? '400px' : '100%',
          },
          header: {
            borderBottom: 'none',
            cursor: 'grab',
            padding: '11px',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
        destroyOnClose={false}
        closeIcon={<div />}
        afterOpenChange={handleAfterOpenChange}
      >
        <div style={{ width: '100%' }}>
          <StockDetailHeader
            selectedCompany={selectedCompany}
            stockPrice={selectedCompany ? companiesPrice[selectedCompany] : 0}
            stockReturnRate={-12}
            quantity={100}
          />
          <StockInfoBalloon firstLine="✨ 제 정보에 의하면..." secondLine="다음 주기에 주가가 오를 것 같아요!" />
          <LineChart
            company={selectedCompany}
            priceData={[100000, 124700, 537000, 7300, 3200, 200000, 203000, 200000, 103000, 79000, 89000]}
            fluctuationsInterval={5}
            averagePurchasePrice={100000}
          />
          <ButtonContainer>
            <Flex>
              <BuyButton onClick={() => onClickBuy(selectedCompany)} disabled={isDisabled}>
                사기
              </BuyButton>
              <SellButton onClick={() => onClickSell(selectedCompany)} disabled={isDisabled}>
                팔기
              </SellButton>
            </Flex>
            <SellAllButton onClick={() => onClickSellAll(selectedCompany)} disabled={isDisabled}>
              모두 팔기
            </SellAllButton>
          </ButtonContainer>
        </div>
      </Drawer>
    </>
  );
};

export default Buy;

interface StockDetailHeaderProps {
  selectedCompany: string;
  stockPrice: number;
  stockReturnRate: number;
  quantity: number;
}

function StockDetailHeader({ selectedCompany, stockPrice, stockReturnRate, quantity }: StockDetailHeaderProps) {
  const isPositive = stockReturnRate >= 0;

  return (
    <Container>
      <FlexRow>
        <FlexColumn>
          <CompanyName>{selectedCompany}</CompanyName>
          <Quantity>보유 주식: {quantity}</Quantity>
        </FlexColumn>
        <FlexColumn style={{ alignItems: 'flex-end', rowGap: '16px' }}>
          <StockPrice>{stockPrice.toLocaleString()}원</StockPrice>
          <Badge>
            <StockReturnRate>
              {isPositive ? '+' : ''}
              {stockReturnRate}% 수익 중
            </StockReturnRate>
          </Badge>
        </FlexColumn>
      </FlexRow>
    </Container>
  );
}

interface StockInfoBalloonProps {
  firstLine: string;
  secondLine?: string;
}

function StockInfoBalloon({ firstLine, secondLine }: StockInfoBalloonProps) {
  return (
    <Balloon>
      <Triangle />
      <StockInfo>
        <span>{firstLine}</span>
        {secondLine && <span>{secondLine}</span>}
      </StockInfo>
    </Balloon>
  );
}

interface LineChartProps {
  company: string;
  priceData: number[];
  fluctuationsInterval: number;
  averagePurchasePrice?: number;
}

/**
 * 주식 가격 차트 컴포넌트
 *
 * @param company - 회사명
 * @param priceData - 시간별 주식 가격 데이터 배열
 * @param fluctuationsInterval - 라운드 간 시간 간격(분)
 * @param averagePurchasePrice - 사용자의 평균 구매 가격 (선택적)
 */
const LineChart = ({
  company,
  priceData = [100000],
  fluctuationsInterval = 5,
  averagePurchasePrice,
}: LineChartProps) => {
  // 차트 DOM 요소 참조
  const chartRef = useRef<HTMLDivElement>(null);
  // echarts 인스턴스 참조
  const chartInstance = useRef<echarts.ECharts>();

  // 라운드 시간 목록 생성 (x축 데이터)
  const roundTimeList = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i * fluctuationsInterval),
    [fluctuationsInterval],
  );

  /**
   * 차트 옵션 생성 함수
   * 데이터나 설정이 변경될 때마다 새로운 옵션 객체 생성
   */
  const getChartOption = useCallback(() => {
    // 평균 구매가 표시를 위한 마커라인 옵션 생성
    const markLineOpts = averagePurchasePrice
      ? {
          markLine: {
            animation: false, // 애니메이션 비활성화
            animationDuration: 0, // 애니메이션 지속 시간 0
            data: [
              {
                lineStyle: {
                  color: '#F59E0B', // 주황색 라인
                },
                yAxis: averagePurchasePrice, // y축 위치 (평균 구매가)
              },
            ],
            label: {
              backgroundColor: 'rgba(37, 40, 54, 0.7)', // 라벨 배경색
              borderRadius: 2,
              color: '#F59E0B', // 라벨 텍스트 색상
              distance: [0, -5], // 라벨 위치 조정
              fontSize: 12,
              formatter: `평균 구매가: ${averagePurchasePrice.toLocaleString()}원`, // 라벨 텍스트
              padding: [2, 4],
              position: 'insideEndTop', // 라벨 위치
            },
            lineStyle: {
              color: '#F59E0B', // 주황색 라인
              type: 'solid',
              width: 1.5,
            },
            silent: true, // 마커라인 이벤트 비활성화
            symbol: 'none', // 양쪽 끝 심볼 제거
          },
        }
      : {};

    return {
      animation: true, // 차트 기본 애니메이션 활성화
      grid: {
        bottom: '8%', // 차트 영역 여백 설정
        containLabel: true, // 라벨 포함 여부
        left: '5%',
        right: '2%',
        top: '8%',
      },
      series: [
        {
          data: priceData, // 주식 가격 데이터
          emphasis: {
            // 호버 시 데이터 포인트 스타일
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2,
              color: '#007AFF',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 122, 255, 0.5)',
            },
            scale: true, // 호버 시 약간 확대
          },
          itemStyle: {
            color: '#007AFF', // 데이터 포인트 색상
          },
          smooth: true, // 곡선 그래프
          symbol: 'circle', // 데이터 포인트 모양
          symbolSize: 12, // 데이터 포인트 크기
          type: 'line', // 라인 차트 타입
          ...markLineOpts, // 평균 구매가 마커라인 옵션 추가
        },
      ],
      tooltip: {
        // 툴팁 설정
        backgroundColor: 'rgba(37, 40, 54, 0.9)', // 툴팁 배경색
        borderColor: '#374151', // 툴팁 테두리 색상
        borderWidth: 1,
        confine: true, // 툴팁이 차트 영역을 벗어나지 않도록 함
        enterable: true, // 툴팁에 마우스 진입 가능
        formatter: (params: { dataIndex: number; value: number }) => {
          // 라운드 번호와 가격 정보 표시
          const roundNumber = roundTimeList[params.dataIndex];
          const price = params.value.toLocaleString();

          // 평균 구매가와 비교하여 수익률 계산 (평균 구매가가 있을 경우)
          let profitInfo = '';
          if (averagePurchasePrice && params.value) {
            const profitRate = (((params.value - averagePurchasePrice) / averagePurchasePrice) * 100).toFixed(2);
            const isProfit = params.value >= averagePurchasePrice;
            profitInfo = `<div style="margin-top: 4px; color: ${isProfit ? '#34D399' : '#F87171'}">
                            ${isProfit ? '+' : ''}${profitRate}%
                          </div>`;
          }

          return `<div style="padding: 8px;">
                    <div style="margin-bottom: 4px;">${company}</div>
                    <div style="font-weight: bold; font-size: 16px;">
                      <span style="color: #007AFF;">${roundNumber}분</span> ${price}원
                    </div>
                    ${profitInfo}
                  </div>`;
        },
        textStyle: {
          color: '#fff', // 툴팁 텍스트 색상
          fontSize: 14, // 텍스트 크기
        },
        trigger: 'item', // 데이터 포인트에 호버할 때만 툴팁 표시
      },
      xAxis: {
        // x축 설정
        axisLabel: {
          color: '#9CA3AF', // x축 라벨 색상
        },
        axisLine: {
          lineStyle: {
            color: '#374151', // x축 선 색상
          },
        },
        axisTick: {
          show: false, // x축 눈금 숨김
        },
        data: roundTimeList, // x축 데이터 (라운드 시간)
        splitLine: {
          lineStyle: {
            color: '#374151', // 격자 색상
            type: 'dashed', // 격자 스타일
            width: 1,
          },
          show: true, // 격자 표시
        },
        type: 'category', // x축 타입
      },
      yAxis: {
        // y축 설정
        axisLabel: {
          color: '#9CA3AF', // y축 라벨 색상
          formatter: (value: number) => {
            return `${(value / 10000).toLocaleString()}만`; // 단위 변환 (만 단위)
          },
        },
        splitLine: {
          lineStyle: {
            color: '#374151', // 격자 색상
            type: 'dashed', // 격자 스타일
          },
        },
        type: 'value', // y축 타입
      },
    };
  }, [company, priceData, roundTimeList, averagePurchasePrice]);

  /**
   * 차트 초기화 함수
   * 차트 옵션이 변경될 때마다 차트를 다시 그림
   */
  const initChart = useCallback(() => {
    if (chartRef.current) {
      // 기존 차트가 있다면 제거
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 새로운 차트 인스턴스 생성
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption(getChartOption());
    }
  }, [getChartOption]);

  /**
   * Drawer가 열릴 때마다 차트 재초기화
   * 애니메이션 완료 후 차트를 그리기 위해 setTimeout 사용
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // 컴포넌트가 마운트된 상태일 때만 타이머 설정
    if (chartRef.current) {
      timer = setTimeout(() => {
        // 타이머 실행 시점에 컴포넌트가 여전히 마운트되어 있는지 확인
        if (chartRef.current) {
          initChart();
        }
      }, 300);
    }

    return () => {
      clearTimeout(timer);
      // 컴포넌트 언마운트 시 차트 정리
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
      }
    };
  }, [initChart]);

  /**
   * 윈도우 리사이즈 이벤트 처리
   * 화면 크기 변경 시 차트 크기 조정
   */
  useEffect(() => {
    const handleResize = () => {
      // 차트 인스턴스가 존재하고 dispose되지 않았는지 확인
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 차트 컨테이너 렌더링
  return <div ref={chartRef} style={{ height: '300px', padding: '0 16px 0 0', width: 'calc(100% - 16px)' }} />;
};

// StockDetailHeader 컴포넌트 스타일링
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const FlexRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  row-gap: 4px;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  row-gap: 4px;
`;

const CompanyName = styled.p`
  font-size: 20px;
  line-height: 22px;
  font-weight: 500;
  margin: 0;
  color: white;
`;

const Quantity = styled.p`
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: #d1d5db;
  margin: 0;
`;

const StockPrice = styled.span`
  font-size: 32px;
  line-height: 20px;
  font-weight: 400;
  color: white;
`;

const Badge = styled.div`
  padding: 4px 8px;
  background-color: #3e4e37;
  border-radius: 100px;
`;

const StockReturnRate = styled.span`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: #a3e635;
  opacity: 1;
`;

// StockInfoBalloon 컴포넌트 스타일링
const Balloon = styled.div`
  padding-left: 20px;
  position: relative;
`;

const Triangle = styled.div`
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 20px solid #111827;
  background-color: #252836;
  margin-left: 14px;
`;

const StockInfo = styled.div`
  width: fit-content;
  height: 64px;
  background-color: #111827;
  border-radius: 8px;
  padding: 12px 20px 12px 12px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  row-gap: 6px;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 8px;
  padding: 0 16px 12px 16px;
`;

const Flex = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 6px;
`;

const BuyButton = styled.button`
  width: 100%;
  height: 52px;
  background-color: #007aff;
  color: white;
  border-radius: 4px;
  border: none;
`;

const SellButton = styled.button`
  width: 100%;
  height: 52px;
  background-color: #f63c6b;
  color: white;
  border-radius: 4px;
  border: none;
`;
const SellAllButton = styled.button`
  width: 100%;
  height: 52px;
  background-color: #374151;
  color: white;
  border-radius: 4px;
  border: none;
`;
