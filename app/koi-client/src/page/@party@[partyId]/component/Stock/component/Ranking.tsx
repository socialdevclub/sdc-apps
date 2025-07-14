import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';
import { TrendingUp, PieChart, LogOut } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Query } from '../../../../../hook';
import { UserStore } from '../../../../../store';
import { LOCAL_STORAGE_KEY } from '../../../../../config/localStorage';

interface RankingProps {
  stockId: string;
}

function Ranking({ stockId }: RankingProps) {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const { partyId } = useParams();
  const navigate = useNavigate();

  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: party } = Query.Party.useQueryParty(partyId);
  const { user } = Query.Stock.useUser({ stockId, userId: supabaseSession?.user.id });

  const { mutateAsync: removeStock } = Query.Stock.useRemoveStockSession(stock?._id ?? '');
  const { mutateAsync: deleteParty } = Query.Party.useDeleteParty(partyId ?? '');
  const isHost = party?.authorId === supabaseSession?.user.id;

  const pieChartRef = useRef<HTMLDivElement>(null);
  const returnChartRef = useRef<HTMLDivElement>(null);
  const totalReturnChartRef = useRef<HTMLDivElement>(null);

  // 연차별 포트폴리오 구성 데이터 계산 (각 연차별로 보유 주식의 가치 비중)
  const investmentData = useMemo(() => {
    if (!stock || !user) return [];

    const yearlyData: Array<{ year: string; companies: Array<{ name: string; value: number }> }> = [];

    // 0~8년차 각각의 포트폴리오 구성 계산
    for (let year = 0; year < 9; year++) {
      const companiesPortfolio: Array<{ name: string; value: number }> = [];
      let totalPortfolioValue = 0;

      // 각 회사별 누적 보유량 계산
      user.stockStorages.forEach((storage) => {
        const { companyName, stockCountHistory } = storage;
        const companyPrices = stock.companies[companyName];

        if (!companyPrices || year >= stockCountHistory.length) return;

        // 해당 연차까지의 누적 보유량 계산
        let cumulativeHolding = 0;
        for (let i = 0; i <= year; i++) {
          cumulativeHolding += stockCountHistory[i] || 0;
        }

        // 보유량이 양수인 경우만 포트폴리오에 포함
        if (cumulativeHolding > 0 && companyPrices[year]) {
          const portfolioValue = cumulativeHolding * companyPrices[year].가격;
          totalPortfolioValue += portfolioValue;

          companiesPortfolio.push({
            name: companyName,
            value: Math.round(portfolioValue),
          });
        }
      });

      // 포트폴리오가 있다면 추가, 없다면 빈 포트폴리오 표시
      if (totalPortfolioValue > 0) {
        yearlyData.push({
          companies: companiesPortfolio,
          year: `${year}년차`,
        });
      } else {
        // 보유 주식이 없는 년차
        yearlyData.push({
          companies: [{ name: '보유 주식 없음', value: 1 }],
          year: `${year}년차`,
        });
      }
    }

    return yearlyData;
  }, [stock, user]);

  // 전체 포트폴리오 연차별 수익률 데이터 계산
  const totalReturnsData = useMemo(() => {
    if (!stock || !user) return { returns: [], years: [] };

    const years = Array.from({ length: 10 }, (_, i) => `${i}년차`);
    const returns: number[] = [];

    // 각 연차별 전체 포트폴리오 수익률 계산
    for (let year = 0; year < 10; year++) {
      let totalInvestedAmount = 0;
      let totalCurrentValue = 0;
      let totalRealizedProfitLoss = 0;

      // 모든 회사를 대상으로 계산
      user.stockStorages.forEach((storage) => {
        const { companyName, stockCountHistory } = storage;
        const companyPrices = stock.companies[companyName];

        if (!companyPrices || year >= stockCountHistory.length) return;

        let currentHolding = 0;
        let companyInvestedAmount = 0;
        let companyRealizedProfitLoss = 0;
        const purchases: Array<{ count: number; price: number }> = [];

        // 해당 연도까지의 거래 내역을 누적하여 계산
        for (let i = 0; i <= year; i++) {
          const tradeCount = stockCountHistory[i] || 0;
          const price = companyPrices[i]?.가격 || 0;

          if (tradeCount > 0) {
            // 매수: 투자 비용 증가, 보유량 증가
            companyInvestedAmount += tradeCount * price;
            currentHolding += tradeCount;
            purchases.push({ count: tradeCount, price });
          } else if (tradeCount < 0) {
            // 매도: 실현손익 계산 (FIFO 방식)
            let remainingSellCount = Math.abs(tradeCount);
            currentHolding -= remainingSellCount;

            while (remainingSellCount > 0 && purchases.length > 0) {
              const purchase = purchases[0];
              const sellFromThisPurchase = Math.min(remainingSellCount, purchase.count);

              // 실현손익 = (매도가 - 매수가) * 매도량
              companyRealizedProfitLoss += sellFromThisPurchase * (price - purchase.price);

              purchase.count -= sellFromThisPurchase;
              remainingSellCount -= sellFromThisPurchase;

              if (purchase.count === 0) {
                purchases.shift();
              }
            }
          }
        }

        // 전체 포트폴리오에 반영
        totalInvestedAmount += companyInvestedAmount;
        totalCurrentValue += currentHolding * (companyPrices[year]?.가격 || 0);
        totalRealizedProfitLoss += companyRealizedProfitLoss;
      });

      // 수익률 계산
      if (totalInvestedAmount > 0) {
        const totalAssetValue = totalCurrentValue + totalRealizedProfitLoss;
        const returnRate = ((totalAssetValue - totalInvestedAmount) / totalInvestedAmount) * 100;
        returns.push(Math.round(returnRate * 10) / 10);
      } else {
        returns.push(0);
      }
    }

    return { returns, years };
  }, [stock, user]);

  // 회사별 연차수익률 데이터 계산
  const returnsData = useMemo(() => {
    if (!stock || !user) return { companies: [], years: [] };

    const years = Array.from({ length: 10 }, (_, i) => `${i}년차`);
    const companies: { name: string; data: number[] }[] = [];

    user.stockStorages.forEach((storage) => {
      const { companyName, stockCountHistory } = storage;
      const companyPrices = stock.companies[companyName];

      if (!companyPrices) return;

      const companyReturns: number[] = [];

      // 각 연차별 수익률 계산
      for (let year = 0; year < 10; year++) {
        if (year >= stockCountHistory.length) {
          companyReturns.push(0);
          continue;
        }

        let currentHolding = 0;
        let totalInvestedAmount = 0;
        let realizedProfitLoss = 0;
        const purchases: Array<{ count: number; price: number }> = [];

        // 해당 연도까지의 거래 내역을 누적하여 계산
        for (let i = 0; i <= year; i++) {
          const tradeCount = stockCountHistory[i] || 0;
          const price = companyPrices[i]?.가격 || 0;

          if (tradeCount > 0) {
            // 매수: 투자 비용 증가, 보유량 증가
            totalInvestedAmount += tradeCount * price;
            currentHolding += tradeCount;
            purchases.push({ count: tradeCount, price });
          } else if (tradeCount < 0) {
            // 매도: 실현손익 계산 (FIFO 방식)
            let remainingSellCount = Math.abs(tradeCount);
            currentHolding -= remainingSellCount;

            while (remainingSellCount > 0 && purchases.length > 0) {
              const purchase = purchases[0];
              const sellFromThisPurchase = Math.min(remainingSellCount, purchase.count);

              // 실현손익 = (매도가 - 매수가) * 매도량
              realizedProfitLoss += sellFromThisPurchase * (price - purchase.price);

              purchase.count -= sellFromThisPurchase;
              remainingSellCount -= sellFromThisPurchase;

              if (purchase.count === 0) {
                purchases.shift();
              }
            }
          }
        }

        // 수익률 계산
        if (totalInvestedAmount > 0) {
          // 현재 보유 주식의 시장가치
          const currentMarketValue = currentHolding * (companyPrices[year]?.가격 || 0);

          // 총 자산가치 = 현재 보유 주식 가치 + 실현손익
          const totalAssetValue = currentMarketValue + realizedProfitLoss;

          // 수익률 = (총자산가치 - 총투자액) / 총투자액 * 100
          const returnRate = ((totalAssetValue - totalInvestedAmount) / totalInvestedAmount) * 100;
          companyReturns.push(Math.round(returnRate * 10) / 10);
        } else {
          companyReturns.push(0);
        }
      }

      // 의미있는 거래가 있는 회사만 추가
      const hasTrading = companyReturns.some((val) => val !== 0);
      if (hasTrading) {
        companies.push({
          data: companyReturns,
          name: companyName,
        });
      }
    });

    return { companies, years };
  }, [stock, user]);

  // 연차별 투자 비중 차트들 초기화
  useEffect(() => {
    if (!pieChartRef.current || investmentData.length === 0) return undefined;

    // 기존 차트가 있다면 제거
    pieChartRef.current.innerHTML = '';

    investmentData.forEach((yearData, index) => {
      // 각 연차별로 개별 차트 컨테이너 생성
      const chartContainer = document.createElement('div');
      chartContainer.style.width = '100%';
      chartContainer.style.maxWidth = '100%';
      chartContainer.style.height = '300px';
      chartContainer.style.marginBottom = '20px';
      chartContainer.style.boxSizing = 'border-box';

      // 연차 제목 추가
      const title = document.createElement('h3');
      title.textContent = yearData.year;
      title.style.color = '#ffffff';
      title.style.textAlign = 'center';
      title.style.marginBottom = '10px';
      title.style.fontSize = '18px';

      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.maxWidth = '100%';
      wrapper.style.boxSizing = 'border-box';
      wrapper.appendChild(title);
      wrapper.appendChild(chartContainer);

      pieChartRef.current!.appendChild(wrapper);

      // ECharts 초기화
      const chart = echarts.init(chartContainer, null, {
        renderer: 'canvas',
        useDirtyRect: false,
      });

      const option = {
        animation: false,
        legend: {
          bottom: 0,
          itemHeight: 14,
          itemWidth: 14,
          orient: 'horizontal',
          textStyle: {
            color: '#ffffff',
            fontSize: 12,
          },
        },
        series: [
          {
            center: ['50%', '45%'],
            data: yearData.companies.map((company) => ({
              ...company,
              // "보유 주식 없음" 항목은 회색으로 표시
              itemStyle: company.name === '보유 주식 없음' ? { color: '#666666' } : undefined,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowOffsetX: 0,
              },
            },
            label: {
              color: '#ffffff',
              formatter: '{b}\n{d}%',
            },
            name: yearData.year,
            radius: '60%',
            type: 'pie',
          },
        ],
        tooltip: {
          formatter: (params: { name: string; value: number; percent: number }) => {
            if (params.name === '보유 주식 없음') {
              return `${yearData.year} <br/>${params.name}`;
            }
            return `${params.name}: ${params.value.toLocaleString()}원 (${params.percent}%)`;
          },
          trigger: 'item',
        },
      };

      chart.setOption(option);

      // 리사이즈 이벤트 등록
      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
    });

    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, [investmentData]);

  // 전체 포트폴리오 수익률 차트 초기화
  useEffect(() => {
    if (!totalReturnChartRef.current || totalReturnsData.returns.length === 0) return undefined;

    const chart = echarts.init(totalReturnChartRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });

    const option = {
      animation: false,
      grid: {
        bottom: '15%',
        containLabel: true,
        left: '10%',
        right: '10%',
        top: '15%',
      },
      series: [
        {
          data: totalReturnsData.returns,
          itemStyle: {
            color: (params: { value: number }) => {
              return params.value >= 0 ? '#10B981' : '#EF4444';
            },
          },
          lineStyle: {
            color: '#10B981',
            width: 3,
          },
          markLine: {
            data: [{ yAxis: 0 }],
            lineStyle: {
              color: '#666666',
              type: 'dashed',
            },
            symbol: 'none',
          },
          name: '전체 수익률',
          smooth: true,
          type: 'line',
        },
      ],
      tooltip: {
        formatter: (params: { name: string; value: number }) => {
          const color = params.value >= 0 ? '#10B981' : '#EF4444';
          return `${params.name}<br/><span style="color: ${color}">전체 수익률: ${params.value}%</span>`;
        },
        trigger: 'item',
      },
      xAxis: {
        axisLabel: {
          color: '#ffffff',
          fontSize: 12,
        },
        data: totalReturnsData.years,
        type: 'category',
      },
      yAxis: {
        axisLabel: {
          color: '#ffffff',
          fontSize: 12,
          formatter: '{value}%',
        },
        name: '수익률(%)',
        nameTextStyle: {
          color: '#ffffff',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: '#374151',
          },
        },
        type: 'value',
      },
    };

    chart.setOption(option);

    // 리사이즈 이벤트 등록
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [totalReturnsData]);

  // 회사별 연차수익률 차트 초기화
  useEffect(() => {
    if (!returnChartRef.current || returnsData.companies.length === 0) return undefined;

    const chart = echarts.init(returnChartRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });

    // 색상 팔레트
    const colors = ['#60A5FA', '#F87171', '#34D399', '#FBBF24', '#A78BFA', '#FB7185', '#10B981', '#F59E0B'];

    const option = {
      animation: false,
      grid: {
        bottom: '20%',
        containLabel: true,
        left: '10%',
        right: '10%',
        top: '10%',
      },
      legend: {
        bottom: 0,
        data: returnsData.companies.map((company) => company.name),
        itemHeight: 14,
        itemWidth: 14,
        textStyle: {
          color: '#ffffff',
          fontSize: 12,
        },
      },
      series: returnsData.companies.map((company, index) => ({
        data: company.data,
        itemStyle: {
          color: colors[index % colors.length],
        },
        lineStyle: {
          color: colors[index % colors.length],
        },
        name: company.name,
        type: 'line',
      })),
      tooltip: {
        formatter(params: Array<{ name: string; seriesName: string; value: number }>) {
          let result = `${params[0].name}<br/>`;
          params.forEach((param) => {
            result += `${param.seriesName}: ${param.value}%<br/>`;
          });
          return result;
        },
        trigger: 'axis',
      },
      xAxis: {
        axisLabel: {
          color: '#ffffff',
          fontSize: 12,
        },
        data: returnsData.years,
        type: 'category',
      },
      yAxis: {
        axisLabel: {
          color: '#ffffff',
          fontSize: 12,
          formatter: '{value}%',
        },
        name: '수익률(%)',
        nameTextStyle: {
          color: '#ffffff',
          fontSize: 12,
        },
        type: 'value',
      },
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [returnsData]);

  // 방 나가기 핸들러
  async function handleExit() {
    if (isHost && window.confirm('정말 나가시겠습니까? 방이 삭제됩니다.')) {
      await removeStock({ stockId: stock?._id ?? '' });
      await deleteParty({ partyId: partyId ?? '' });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      navigate('/');
    } else if (!isHost) {
      navigate('/');
    }
  }

  if (!stock || !supabaseSession || !user) {
    return <LoadingContainer>포트폴리오를 분석하는 중...</LoadingContainer>;
  }

  return (
    <Container>
      <SubTitle>
        <TrendingUp size={24} />
        <span>전체 포트폴리오 수익률</span>
      </SubTitle>

      <ChartWrapper ref={totalReturnChartRef} />

      <SubTitle>
        <PieChart size={24} />
        <span>연차별 투자 비중</span>
      </SubTitle>

      <ChartWrapper ref={pieChartRef} className={investmentData.length > 1 ? 'scrollable' : ''} />

      <SubTitle>
        <TrendingUp size={24} />
        <span>회사별 연차수익률</span>
      </SubTitle>

      <ChartWrapper ref={returnChartRef} />

      <BottomSection>
        <Button color="#F63C6B" onClick={() => handleExit()}>
          <LogOut size={24} />
          <Label>나가기</Label>
        </Button>
      </BottomSection>
    </Container>
  );
}

export default Ranking;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100vw;
  height: 100%;
  gap: 20px;
  padding: 0 16px;
  box-sizing: border-box;
  margin-bottom: 100px;
  overflow-x: hidden;

  @media (max-width: 405px) {
    max-width: 375px;
    padding: 0 12px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #9ca3af;
`;

const SubTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  gap: 10px;
  font-size: 23px;
  line-height: 135%;
  box-sizing: border-box;
  word-wrap: break-word;
`;

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
  background: rgba(37, 40, 54, 0.8);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #374151;
  box-sizing: border-box;
  overflow: hidden;
`;

const ChartWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  height: 300px;
  box-sizing: border-box;

  &.scrollable {
    max-height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
    height: auto;
  }
`;

const TotalInvestment = styled.div`
  margin-top: 12px;
  font-size: 16px;
  color: #9ca3af;
  text-align: center;
`;

const BottomSection = styled.div`
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100vw;
  padding: 16px;
  box-sizing: border-box;
  border-top: 1px solid #1d283a;
  background-color: #1d283a;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`;

const Button = styled.button<{ color: string }>`
  background-color: ${({ color }) => color};
  height: 60px;
  font-size: 23px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  width: 100%;
  max-width: 100%;
  gap: 10px;
  color: white;
  border: none;
  cursor: pointer;
  padding: 14px;
  box-sizing: border-box;
`;

const Label = styled.span`
  font-size: 23px;
  color: white;
  font-family: 'DungGeunMo';
  white-space: nowrap;
`;
