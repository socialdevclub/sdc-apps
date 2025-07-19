import React, { useMemo } from 'react';
import { Response, StockSchemaWithId } from 'shared~type-stock';
import DoughnutChart from '../../../../../../component-presentation/DoughnutChart';
import LineChart from '../../../../../../component-presentation/LineChart';
import { calculateInvestmentData } from '../../utils/calculateInvestmentData';
import { calculateCompanyReturnRate } from '../../utils/calculateReturnRate';
import { formatRatio, formatPercentage, formatChangeRate, calculateChangeRate } from '../../utils/calculatePercentage';

interface ResultRealismProps {
  stock: StockSchemaWithId;
  user: Response.GetStockUser;
}

/**
 * 자산별 고정 색상 매핑
 * 각 자산이 항상 동일한 색상으로 표시되도록 해요
 */
const getAssetColor = (assetName: string): string => {
  const colorMap: Record<string, string> = {
    // 터쿼이즈 - 안정적인 자산을 나타내는 차분한 색상
    // 주요 ETF/인덱스
    QQQ: '#FF6B6B',

    // 산호 핑크 - 기술주 중심의 활발한 느낌
    'S&P500': '#45B7D1',

    // 따뜻한 노랑 - 안전자산의 안정감
    TDF2030: '#DDA0DD',

    // 레드 - 밈코인의 위험성
    금: '#FFD700',

    // 페일 터쿼이즈 - 원화 안전자산
    미국달러SOFR: '#F7DC6F',

    // 골드 - 금의 본래 색상
    // 기타 자산
    '보유 자산 없음': '#CCCCCC',

    // 골든 옐로우 - 달러 자산
    // 대체투자/고위험자산
    비트코인: '#FF8C42',

    // 라벤더 - 목표일펀드의 계획성
    '원화 CMA': '#98D8C8',

    // 민트 그린 - 한국 시장
    // 채권/안전자산
    채권: '#FFEAA7',

    // 스카이 블루 - 안정적인 미국 시장
    코스피: '#96CEB4',

    // 오렌지 - 암호화폐의 역동성
    해삐코인: '#E74C3C',

    // 현금
    현금: '#4ECDC4', // 그레이 - 빈 상태
  };

  // 매핑된 색상이 있으면 반환, 없으면 기본 색상 중 하나를 해시 기반으로 선택
  if (colorMap[assetName]) {
    return colorMap[assetName];
  }

  // 기본 색상 팔레트에서 자산명 기반으로 일관된 색상 선택
  const defaultColors = [
    '#BB8FCE',
    '#85C1E9',
    '#F8C471',
    '#82E0AA',
    '#F1948A',
    '#85C1E9',
    '#D7BDE2',
    '#A9DFBF',
    '#F9E79F',
    '#FADBD8',
  ];

  const hash = assetName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return defaultColors[hash % defaultColors.length];
};

/**
 * 포트폴리오 테이블 컴포넌트
 * 자산별 색상, 이름, 비율, 이후 수익률을 테이블로 표시해요
 */
interface PortfolioTableProps {
  data: Array<{
    color: string;
    label: string;
    value: number;
  }>;
  totalValue: number;
  currentRound: number;
  stock: StockSchemaWithId;
  user: Response.GetStockUser;
}

const PortfolioTable = ({ data, totalValue, currentRound, stock, user }: PortfolioTableProps) => {
  return (
    <div style={{ marginTop: '20px', padding: '0 16px' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '14px', width: '100%' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'left' }}>자산</th>
            <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>가치</th>
            <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>비율</th>
            <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>수익률</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            // 비율 계산 (소수점 2자리까지)
            const percentage = formatRatio(item.value, totalValue);

            // 이후 수익률 계산
            let returnRate: number | null = null;
            if (item.label !== '현금' && item.label !== '보유 자산 없음') {
              returnRate = calculateCompanyReturnRate(stock, user, item.label, currentRound);
            }

            return (
              <tr key={`${item.label}-${item.value}`} style={{ borderBottom: '1px solid #f0f0f0', fontSize: '12px' }}>
                <td style={{ padding: '10px 8px' }}>
                  <div style={{ alignItems: 'center', display: 'flex', gap: '6px' }}>
                    {/* 색상 표시 */}
                    <div
                      style={{
                        backgroundColor: item.color,
                        borderRadius: '3px',
                        flexShrink: 0,
                        height: '12px',
                        width: '12px',
                      }}
                    />
                    <span>{item.label}</span>
                  </div>
                </td>
                <td style={{ fontWeight: '500', padding: '10px 8px 10px 0px', textAlign: 'right' }}>
                  {item.value.toLocaleString()}원
                </td>
                <td style={{ fontWeight: '500', padding: '10px 8px', textAlign: 'right' }}>{percentage}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                  {returnRate !== null ? (
                    <span
                      style={{
                        color: returnRate >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: '500',
                      }}
                    >
                      {formatPercentage(returnRate, { showSign: true })}
                    </span>
                  ) : (
                    <span style={{ color: '#6b7280' }}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
          {/* 합계 행 */}
          {(() => {
            // 0년차는 null, 다른 년차는 전체 포트폴리오 기준 수익률 계산
            let averageReturn: number | null = null;

            if (currentRound > 0) {
              // 이전 라운드의 총 포트폴리오 가치 계산
              const previousRoundData = calculateInvestmentData(stock, user)[currentRound - 1];
              if (previousRoundData) {
                const previousTotalValue = previousRoundData.companies.reduce((acc, company) => acc + company.value, 0);

                // 전체 포트폴리오 수익률 계산: (현재 총가치 - 이전 총가치) / 이전 총가치 * 100
                if (previousTotalValue > 0) {
                  averageReturn = ((totalValue - previousTotalValue) / previousTotalValue) * 100;
                }
              }
            }

            return (
              <tr
                style={{
                  // backgroundColor: '#f5f5f5',
                  // borderTop: '2px solid #333333',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              >
                <td style={{ fontWeight: '500', padding: '10px 8px 10px 4px' }} />
                <td style={{ fontWeight: '500', padding: '10px 8px 10px 0px', textAlign: 'right' }}>
                  {totalValue.toLocaleString()}원
                </td>
                <td style={{ fontWeight: '500', padding: '10px 8px 10px 4px', textAlign: 'right' }}>100.00%</td>
                <td style={{ fontWeight: '500', padding: '10px 8px 10px 4px', textAlign: 'right' }}>
                  {averageReturn !== null ? (
                    <span
                      style={{
                        color: averageReturn >= 0 ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {formatPercentage(averageReturn, { showSign: true })}
                    </span>
                  ) : (
                    <span style={{ color: '#6b7280' }}>-</span>
                  )}
                </td>
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
};

/**
 * 주식 게임 결과를 현실적인 포트폴리오 차트로 보여주는 컴포넌트예요
 * 연도별로 사용자의 주식 보유 현황과 현금을 포함한 전체 자산을 도넛 차트로 시각화해요
 */
const ResultRealism = ({ stock, user }: ResultRealismProps) => {
  // 사용자의 주식 거래 내역과 현금 보유 이력을 바탕으로 연도별 포트폴리오를 계산해요
  const portfolioData = useMemo(() => calculateInvestmentData(stock, user), [stock, user]);

  // 포트폴리오 데이터를 차트에서 사용할 수 있는 형태로 변환해요
  const portfolioList = useMemo(
    () =>
      portfolioData.map((yearData) => {
        // 연도를 라운드 인덱스로 변환 ("0년차" -> 0)
        const currentRound = parseInt(yearData.year.replace('년차', ''), 10);

        // 빈 포트폴리오인 경우 차트를 표시하지 않아요
        if (yearData.companies.length === 1 && yearData.companies[0].name === '보유 자산 없음') {
          return {
            currentRound,
            isEmpty: true,
            portfolioData: [],
            totalValue: 0,
            year: yearData.year,
          };
        }

        // 해당 연도의 총 자산 가치를 계산해요 (주식 + 현금)
        const totalValue = yearData.companies.reduce((acc, company) => acc + company.value, 0);

        // 각 자산별 데이터를 차트용 데이터로 변환해요
        const chartData = yearData.companies.map((company) => {
          // 전체 포트폴리오에서 해당 자산이 차지하는 비율을 계산해요
          return {
            // 해당 자산의 총 가치예요
            color: getAssetColor(company.name),
            label: `${company.name}`,
            // 자산명과 비율을 표시해요
            value: company.value, // 자산별 고정 색상을 지정해요
          };
        });

        return {
          currentRound,
          isEmpty: false,
          portfolioData: chartData,
          totalValue,
          year: yearData.year,
        };
      }),
    [portfolioData],
  );

  // 년차별 총자산 데이터 생성 (라인 차트용)
  const lineChartData = useMemo(
    () =>
      portfolioList.map((item) => ({
        value: item.totalValue,
        year: item.year,
      })),
    [portfolioList],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
      {/* 총자산 변화 그래프 */}
      <div style={{ padding: '0 16px' }}>
        <h2 style={{ marginBottom: '20px' }}>총자산 변화</h2>
        <LineChart data={lineChartData} height={200} />

        {/* 총자산 변화 테이블 */}
        <div style={{ marginTop: '20px' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '14px', width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'center' }}>년차</th>
                <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>총자산</th>
                <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>증감액</th>
                <th style={{ fontWeight: '600', padding: '12px 8px', textAlign: 'right' }}>증감률</th>
              </tr>
            </thead>
            <tbody>
              {lineChartData.map((item, index) => {
                const currentValue = item.value;
                const previousValue = index > 0 ? lineChartData[index - 1].value : 0;

                // 증감액 계산
                const changeAmount = index > 0 ? currentValue - previousValue : 0;

                return (
                  <tr key={item.year} style={{ borderBottom: '1px solid #f0f0f0', fontSize: '12px' }}>
                    <td style={{ fontWeight: '500', padding: '10px 8px', textAlign: 'center' }}>{item.year}</td>
                    <td style={{ fontWeight: '500', padding: '10px 8px', textAlign: 'right' }}>
                      {currentValue.toLocaleString()}원
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      {index > 0 ? (
                        <span
                          style={{
                            color: changeAmount >= 0 ? '#22c55e' : '#ef4444',
                            fontWeight: '500',
                          }}
                        >
                          {changeAmount >= 0 ? '+' : ''}
                          {changeAmount.toLocaleString()}원
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      {index > 0 ? (
                        <span
                          style={{
                            color: calculateChangeRate(currentValue, previousValue) >= 0 ? '#22c55e' : '#ef4444',
                            fontWeight: '500',
                          }}
                        >
                          {formatChangeRate(currentValue, previousValue)}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 각 연도별 포트폴리오를 차트로 표시해요 */}
      {portfolioList.map(({ year, portfolioData: chartData, isEmpty, totalValue, currentRound }) => {
        const sortedChartData = [...chartData].sort((a, b) => b.value - a.value);
        return (
          <div key={year}>
            {/* 연도별 제목과 총 자산 가치를 표시해요 */}
            <h2 style={{ paddingLeft: '16px' }}>{year} 포트폴리오</h2>
            <div style={{ width: '100%' }}>
              {isEmpty ? (
                <div
                  style={{
                    color: '#999',
                    fontSize: '14px',
                    padding: '40px 16px',
                    textAlign: 'center',
                  }}
                >
                  보유 자산이 없어요
                </div>
              ) : (
                <>
                  {/* 주식과 현금을 포함한 전체 자산을 차트에 표시해요 */}
                  <DoughnutChart data={sortedChartData} minHeight={200} maxHeight={200} />

                  {/* 포트폴리오 상세 테이블 */}
                  <PortfolioTable
                    data={sortedChartData}
                    totalValue={totalValue}
                    currentRound={currentRound}
                    stock={stock}
                    user={user}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultRealism;
