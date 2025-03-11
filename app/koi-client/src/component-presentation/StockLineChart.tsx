import * as echarts from 'echarts';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

interface StockLineChartProps {
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
const StockLineChart = (props: StockLineChartProps) => {
  const { company, priceData = [100000], fluctuationsInterval = 5, averagePurchasePrice } = props;

  // 차트 DOM 요소 참조
  const chartRef = useRef<HTMLDivElement>(null);
  // echarts 인스턴스 참조
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 라운드 시간 목록 생성 (x축 데이터)
  const roundTimeList = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i * fluctuationsInterval),
    [fluctuationsInterval],
  );

  // 데이터 메모이제이션 - 불필요한 리렌더링 방지
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedPriceData = useMemo(() => priceData, [JSON.stringify(priceData)]);
  const memoizedAveragePrice = useMemo(() => averagePurchasePrice, [averagePurchasePrice]);
  const memoizedCompany = useMemo(() => company, [company]);

  /**
   * 차트 옵션 생성 함수
   */
  const getChartOption = useCallback(() => {
    // 마지막 가격 값 가져오기
    const lastPrice = memoizedPriceData[memoizedPriceData.length - 1] || 100000;

    // 데이터의 최소값과 최대값 찾기
    const minDataValue = Math.min(...memoizedPriceData);
    const maxDataValue = Math.max(...memoizedPriceData);

    // 평균 구매가도 고려하여 범위 계산
    const minValueToConsider = memoizedAveragePrice ? Math.min(minDataValue, memoizedAveragePrice) : minDataValue;
    const maxValueToConsider = memoizedAveragePrice ? Math.max(maxDataValue, memoizedAveragePrice) : maxDataValue;

    // 데이터 범위 계산
    const dataRange = maxValueToConsider - minValueToConsider;

    // 패딩 추가 (데이터 범위의 20%)
    const padding = dataRange * 0.2;

    // y축 범위 계산 (모든 데이터 포인트가 보이도록 + 마지막 값이 중앙에 가깝게)
    let minPrice = Math.max(0, minValueToConsider - padding);
    let maxPrice = maxValueToConsider + padding;

    // 마지막 값이 중앙에 오도록 조정 (가능한 경우)
    const idealMin = Math.max(0, lastPrice - dataRange / 2 - padding);
    const idealMax = lastPrice + dataRange / 2 + padding;

    // 이상적인 범위가 모든 데이터를 포함하는지 확인
    if (idealMin <= minValueToConsider && idealMax >= maxValueToConsider) {
      minPrice = idealMin;
      maxPrice = idealMax;
    }

    // 평균 구매가 표시를 위한 마커라인 옵션 생성
    const markLineOpts = memoizedAveragePrice
      ? {
          markLine: {
            animation: false, // 애니메이션 비활성화
            animationDuration: 0, // 애니메이션 지속 시간 0
            data: [
              {
                lineStyle: {
                  color: '#F59E0B', // 주황색 라인
                },
                yAxis: memoizedAveragePrice, // y축 위치 (평균 구매가)
              },
            ],
            label: {
              backgroundColor: 'rgba(37, 40, 54, 0.7)', // 라벨 배경색
              borderRadius: 2,
              color: '#F59E0B', // 라벨 텍스트 색상
              distance: [0, 1], // 라벨 위치 조정
              fontFamily: 'DungGeunMo',
              fontSize: 12,
              formatter: `평균 구매가: ${memoizedAveragePrice.toLocaleString()}원`, // 라벨 텍스트
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
      animation: false, // 차트 애니메이션 비활성화
      animationDuration: 0, // 애니메이션 지속 시간 0
      grid: {
        bottom: '8%', // 차트 영역 여백 설정
        containLabel: true, // 라벨 포함 여부
        left: '5%',
        right: '2%',
        top: '8%',
      },
      series: [
        {
          // 라인 차트 타입
          animation: false,

          data: memoizedPriceData,
          // 주식 가격 데이터
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
          smooth: true,
          // 곡선 그래프
          symbol: 'circle',
          // 데이터 포인트 모양
          symbolSize: 12,
          // 데이터 포인트 크기
          type: 'line', // 시리즈 애니메이션 비활성화
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
          if (memoizedAveragePrice && params.value) {
            const profitRate = (((params.value - memoizedAveragePrice) / memoizedAveragePrice) * 100).toFixed(2);
            const isProfit = params.value >= memoizedAveragePrice;
            profitInfo = `<div style="margin-top: 4px; color: ${isProfit ? '#34D399' : '#F87171'}">
                              ${isProfit ? '+' : ''}${profitRate}%
                            </div>`;
          }

          return `<div style="padding: 8px;">
                      <div style="margin-bottom: 4px;">${memoizedCompany}</div>
                      <div style="font-weight: bold; font-size: 16px;">
                        <span style="color: #007AFF;">${roundNumber}분</span> ${price}원
                      </div>
                      ${profitInfo}
                    </div>`;
        },
        textStyle: {
          color: '#fff',
          // 텍스트 크기
          fontFamily: 'DungGeunMo',
          // 툴팁 텍스트 색상
          fontSize: 14,
        },
        trigger: 'item', // 데이터 포인트에 호버할 때만 툴팁 표시
      },
      xAxis: {
        // x축 설정
        axisLabel: {
          color: '#9CA3AF',
          fontFamily: 'DungGeunMo',

          fontSize: 10,
          // x축 라벨 색상
          formatter: '{value}분',
        },
        axisLine: {
          lineStyle: {
            color: '#374151', // x축 선 색상
          },
        },
        axisTick: {
          show: false, // x축 눈금 숨김
        },
        data: roundTimeList,
        // x축 타입
        nameTextStyle: {
          fontFamily: 'DungGeunMo',
        },

        // x축 데이터 (라운드 시간)
        splitLine: {
          lineStyle: {
            color: '#374151', // 격자 색상
            type: 'dashed', // 격자 스타일
            width: 1,
          },
          show: true, // 격자 표시
        },
        type: 'category',
      },
      yAxis: {
        // y축 설정
        axisLabel: {
          color: '#9CA3AF',

          fontFamily: 'DungGeunMo',

          // 최대값 라벨 숨기기
          fontSize: 10,
          // y축 라벨 색상
          formatter: (value: number) => {
            // 최대값 라벨인 경우 빈 문자열 반환
            if (value === maxPrice) {
              return '';
            }
            // 나머지 라벨은 소수점 없이 정수로 표시
            return `${Math.floor(value / 10000).toLocaleString()}만`;
          },
          showMaxLabel: false,
        },

        // 최소 간격을 1로 설정하여 소수점 방지
        axisPointer: {
          label: {
            formatter: (params: { value: number }) => {
              return `${Math.floor(params.value).toLocaleString()}원`;
            },
          },
        },

        // 최대값 설정
        boundaryGap: ['20%', '20%'],

        // 최소값 설정
        max: maxPrice,

        // y축 타입
        min: minPrice,

        // 경계 여백 추가
        minInterval: 1,

        nameTextStyle: {
          fontFamily: 'DungGeunMo',
        },

        splitLine: {
          lineStyle: {
            color: '#374151', // 격자 색상
            type: 'dashed', // 격자 스타일
          },
        },
        type: 'value',
      },
    };
  }, [memoizedCompany, memoizedPriceData, roundTimeList, memoizedAveragePrice]);

  /**
   * 차트 초기화 함수
   */
  const initChart = useCallback(() => {
    // 차트 인스턴스가 이미 있고 dispose되지 않았다면 dispose
    if (chartInstance.current && !chartInstance.current.isDisposed()) {
      chartInstance.current.dispose();
    }

    // chartRef가 존재하고 DOM 요소가 렌더링되었는지 확인
    if (chartRef.current) {
      // DOM 요소의 크기가 유효한지 확인
      if (chartRef.current.clientWidth > 0 && chartRef.current.clientHeight > 0) {
        // 새로운 차트 인스턴스 생성
        chartInstance.current = echarts.init(chartRef.current);

        // 애니메이션 없이 옵션 설정
        chartInstance.current.setOption(getChartOption(), {
          lazyUpdate: true,
          notMerge: true,
          silent: true,
        });
      } else {
        // DOM 요소의 크기가 유효하지 않으면 setTimeout으로 다시 시도
        setTimeout(() => initChart(), 100);
      }
    }
  }, [getChartOption]);

  /**
   * 윈도우 리사이즈 이벤트 처리
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

  /**
   * 컴포넌트 마운트/언마운트 시 차트 초기화/정리
   */
  useEffect(() => {
    // 컴포넌트가 마운트된 후 차트 초기화
    const timer = setTimeout(() => {
      initChart();
    }, 300); // Drawer 애니메이션이 완료될 때까지 기다림

    return () => {
      clearTimeout(timer);
      // 컴포넌트 언마운트 시 차트 정리
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [initChart]);

  /**
   * 차트 데이터 업데이트
   */
  useEffect(() => {
    // 차트 인스턴스가 존재하고 dispose되지 않았는지 확인
    if (chartInstance.current && !chartInstance.current.isDisposed()) {
      chartInstance.current.setOption(getChartOption(), {
        lazyUpdate: true,
        notMerge: false,
        silent: true,
      });
    }
  }, [getChartOption]);

  // 차트 컨테이너 렌더링
  return (
    <div
      ref={chartRef}
      style={{
        height: '230px',
        marginTop: '8px',
        padding: '0 16px 0 0',
        visibility: company ? 'visible' : 'hidden',
        width: 'calc(100% - 16px)', // 회사가 선택되지 않았을 때 숨김
      }}
    />
  );
};

export default React.memo(StockLineChart);
