import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

interface DoughnutChartData {
  label: string;
  value: number;
}

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
          radius: ['45%', '75%'],
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
}

const DoughnutChart = ({ data, height = 400, width = '100%', containerHeight = 300 }: Props) => {
  const { chartRef } = useDoughnutChart(data);

  return (
    <div style={{ height: containerHeight, overflowY: 'hidden' }}>
      <div
        ref={chartRef}
        style={{
          borderRadius: '12px',
          height,
          width,
        }}
      />
    </div>
  );
};

export default DoughnutChart;
