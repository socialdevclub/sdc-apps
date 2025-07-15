import * as echarts from 'echarts';
import { useEffect, useRef, useMemo } from 'react';

interface DoughnutChartData {
  label: string;
  value: number;
}

// 데이터 개수에 따른 높이 계산 함수 (2개 단위로 조정)
const calculateDynamicHeight = (dataLength: number, minHeight = 300, maxHeight = 700) => {
  // 0개일 때는 매우 작은 높이
  if (dataLength === 0) return Math.max(minHeight * 0.6, 120);

  // 2개 단위로 높이 단계 설정: 0, 2, 4, 6, 8, 10+
  const steps = [
    { height: minHeight, max: 2 },
    { height: minHeight + (maxHeight - minHeight) * 0.2, max: 4 },
    { height: minHeight + (maxHeight - minHeight) * 0.4, max: 6 },
    { height: minHeight + (maxHeight - minHeight) * 0.6, max: 8 },
    { height: minHeight + (maxHeight - minHeight) * 0.8, max: 10 },
    { height: maxHeight, max: Infinity }, // 10개 이상 (11개 포함)
  ];

  const step = steps.find((s) => dataLength <= s.max);
  return Math.round(step?.height || maxHeight);
};

const useDoughnutChart = (data: DoughnutChartData[]) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      myChart.current = echarts.init(chartRef.current);
    }

    return () => {
      myChart.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!myChart.current) return;

    // 어두운 배경에 맞는 밝고 생동감 있는 색상 팔레트
    const colorPalette = [
      '#FF6B6B', // 산호 핑크
      '#4ECDC4', // 터쿼이즈
      '#45B7D1', // 스카이 블루
      '#96CEB4', // 민트 그린
      '#FFEAA7', // 따뜻한 노랑
      '#DDA0DD', // 라벤더
      '#98D8C8', // 페일 터쿼이즈
      '#F7DC6F', // 골든 옐로우
      '#BB8FCE', // 연보라
      '#85C1E9', // 라이트 블루
    ];

    const option: echarts.EChartsOption = {
      // 전체 차트 배경색을 투명하게 설정
      backgroundColor: 'transparent',
      color: colorPalette,
      legend: {
        itemGap: 20,
        itemHeight: 14,
        itemWidth: 14,
        left: 'center',
        textStyle: {
          color: '#FFFFFF', // 흰색 텍스트로 변경
          fontSize: 14,
          fontWeight: 500,
        },
      },
      series: [
        {
          animationDuration: 500,
          animationType: 'scale',
          avoidLabelOverlap: false,
          // data: data.map((item) => ({ name: item.label, value: item.value })),
          data: data.filter((item) => item.value > 0).map((item) => ({ name: item.label, value: item.value })),
          emphasis: {
            label: {
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 'bold',
              show: true,
            },
            scale: true,
            scaleSize: 5,
          },
          itemStyle: {
            borderColor: 'rgba(255, 255, 255, 0.8)', // 반투명 흰색 테두리
            borderRadius: 8,
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          label: {
            position: 'center',
            show: false,
          },
          labelLine: {
            show: false,
          },
          name: '포트폴리오',
          radius: ['35%', '65%'],
          type: 'pie',
        },
      ],
    };

    myChart.current.setOption(option);
  }, [data]);

  return { chartRef };
};

interface Props {
  data: {
    label: string;
    value: number;
    [key: string]: unknown;
  }[];
  height?: number | string;
  width?: number | string;
  containerHeight?: number | string;
  autoHeight?: boolean; // 자동 높이 조정 옵션
  minHeight?: number; // 최소 높이
  maxHeight?: number; // 최대 높이
}

const DoughnutChart = ({
  data,
  height = 400,
  width = '100%',
  containerHeight = 450,
  autoHeight = true,
  minHeight = 350,
  maxHeight = 700,
}: Props) => {
  const { chartRef } = useDoughnutChart(data);

  // 유효한 데이터 개수 계산 (value > 0인 항목만)
  const validDataCount = useMemo(() => {
    return data.filter((item) => item.value > 0).length;
  }, [data]);

  // 동적 높이 계산
  const dynamicHeight = useMemo(() => {
    if (!autoHeight) return height;
    const calculatedHeight = calculateDynamicHeight(validDataCount, minHeight, maxHeight);
    console.log(`🎯 DoughnutChart: 데이터 ${validDataCount}개 → 높이 ${calculatedHeight}px`);
    return calculatedHeight;
  }, [autoHeight, validDataCount, height, minHeight, maxHeight]);

  const dynamicContainerHeight = useMemo(() => {
    if (!autoHeight) return containerHeight;
    // 컨테이너 높이는 차트 높이보다 약간 작게 설정
    const calculatedHeight = calculateDynamicHeight(validDataCount, minHeight, maxHeight);
    const containerHeightValue = Math.max(calculatedHeight - 50, minHeight - 50);
    console.log(`📦 DoughnutChart: 컨테이너 높이 ${containerHeightValue}px`);
    return containerHeightValue;
  }, [autoHeight, validDataCount, containerHeight, minHeight, maxHeight]);

  return (
    <div style={{ height: dynamicContainerHeight, overflowY: 'hidden' }}>
      <div
        ref={chartRef}
        style={{
          borderRadius: '12px',
          height: dynamicHeight,
          width,
        }}
      />
    </div>
  );
};

export default DoughnutChart;
