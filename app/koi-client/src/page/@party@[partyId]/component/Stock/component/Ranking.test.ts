import { describe, it, expect } from 'vitest';
import {
  calculatePortfolioAllocation,
  calculateCompanyReturn,
  calculateInvestmentData,
  calculateTotalReturnsData,
  calculateReturnsData,
  type Stock,
  type User,
} from '../../../../../utils/portfolio';

/**
 * 포트폴리오 분석 차트 계산 로직 테스트
 *
 * 이 테스트는 Ranking.tsx에서 사용되는 투자 비중 및 수익률 계산을 검증해요.
 * 공통 계산 로직을 utils/portfolio.ts에서 분리하여 재사용성을 높였어요.
 */

// 목업 데이터
const mockStock: Stock = {
  companies: {
    QQQ: [
      { 가격: 100000, 정보: [] },
      { 가격: 115000, 정보: [] },
      { 가격: 138000, 정보: [] },
      { 가격: 125000, 정보: [] },
      { 가격: 135000, 정보: [] },
      { 가격: 115000, 정보: [] },
      { 가격: 148000, 정보: [] },
      { 가격: 175000, 정보: [] },
      { 가격: 185000, 정보: [] },
      { 가격: 95000, 정보: [] },
    ],
    'S&P500': [
      { 가격: 100000, 정보: [] },
      { 가격: 112000, 정보: [] },
      { 가격: 128000, 정보: [] },
      { 가격: 118000, 정보: [] },
      { 가격: 125000, 정보: [] },
      { 가격: 110000, 정보: [] },
      { 가격: 135000, 정보: [] },
      { 가격: 158000, 정보: [] },
      { 가격: 168000, 정보: [] },
      { 가격: 105000, 정보: [] },
    ],
    TDF2030: [
      { 가격: 100000, 정보: [] },
      { 가격: 107200, 정보: [] },
      { 가격: 115900, 정보: [] },
      { 가격: 120500, 정보: [] },
      { 가격: 125000, 정보: [] },
      { 가격: 118000, 정보: [] },
      { 가격: 130000, 정보: [] },
      { 가격: 142000, 정보: [] },
      { 가격: 148000, 정보: [] },
      { 가격: 68000, 정보: [] },
    ],
    금: [
      { 가격: 100000, 정보: [] },
      { 가격: 108000, 정보: [] },
      { 가격: 115200, 정보: [] },
      { 가격: 125000, 정보: [] },
      { 가격: 135000, 정보: [] },
      { 가격: 128000, 정보: [] },
      { 가격: 145000, 정보: [] },
      { 가격: 158000, 정보: [] },
      { 가격: 172000, 정보: [] },
      { 가격: 195000, 정보: [] },
    ],
    미국달러SOFR: [
      { 가격: 100000, 정보: [] },
      { 가격: 104200, 정보: [] },
      { 가격: 107100, 정보: [] },
      { 가격: 105400, 정보: [] },
      { 가격: 108800, 정보: [] },
      { 가격: 106200, 정보: [] },
      { 가격: 110500, 정보: [] },
      { 가격: 115200, 정보: [] },
      { 가격: 112800, 정보: [] },
      { 가격: 95000, 정보: [] },
    ],
    비트코인: [
      { 가격: 100000, 정보: [] },
      { 가격: 180000, 정보: [] },
      { 가격: 320000, 정보: [] },
      { 가격: 280000, 정보: [] },
      { 가격: 420000, 정보: [] },
      { 가격: 220000, 정보: [] },
      { 가격: 450000, 정보: [] },
      { 가격: 650000, 정보: [] },
      { 가격: 580000, 정보: [] },
      { 가격: 25000, 정보: [] },
    ],
    '원화 CMA': [
      { 가격: 100000, 정보: [] },
      { 가격: 103000, 정보: [] },
      { 가격: 106000, 정보: [] },
      { 가격: 109000, 정보: [] },
      { 가격: 113000, 정보: [] },
      { 가격: 116000, 정보: [] },
      { 가격: 119000, 정보: [] },
      { 가격: 123000, 정보: [] },
      { 가격: 127000, 정보: [] },
      { 가격: 130000, 정보: [] },
    ],
    채권: [
      { 가격: 100000, 정보: [] },
      { 가격: 105500, 정보: [] },
      { 가격: 108200, 정보: [] },
      { 가격: 102500, 정보: [] },
      { 가격: 98000, 정보: [] },
      { 가격: 95000, 정보: [] },
      { 가격: 102000, 정보: [] },
      { 가격: 106000, 정보: [] },
      { 가격: 108500, 정보: [] },
      { 가격: 85000, 정보: [] },
    ],
    코스피: [
      { 가격: 100000, 정보: [] },
      { 가격: 109500, 정보: [] },
      { 가격: 125000, 정보: [] },
      { 가격: 115000, 정보: [] },
      { 가격: 122000, 정보: [] },
      { 가격: 105000, 정보: [] },
      { 가격: 128000, 정보: [] },
      { 가격: 145000, 정보: [] },
      { 가격: 152000, 정보: [] },
      { 가격: 85000, 정보: [] },
    ],
    해삐코인: [
      { 가격: 100000, 정보: [] },
      { 가격: 170000, 정보: [] },
      { 가격: 300000, 정보: [] },
      { 가격: 150000, 정보: [] },
      { 가격: 200000, 정보: [] },
      { 가격: 80000, 정보: [] },
      { 가격: 120000, 정보: [] },
      { 가격: 180000, 정보: [] },
      { 가격: 90000, 정보: [] },
      { 가격: 8000, 정보: [] },
    ],
  },
};

const mockUser: User = {
  stockStorages: [
    {
      companyName: 'QQQ',
      stockCountHistory: [100, 27, -31, 34, 28, 120, 0, 0, 0, -278],
    },
    {
      companyName: '채권',
      stockCountHistory: [90, 27, -29, 38, 0, 0, 0, 0, 0, -126],
    },
    {
      companyName: '해삐코인',
      stockCountHistory: [81, 15, -24, 23, 39, -67, 1, 0, 0, -68],
    },
    {
      companyName: 'S&P500',
      stockCountHistory: [137, 20, -39, 27, 0, 0, -72, 0, 0, -73],
    },
    {
      companyName: '비트코인',
      stockCountHistory: [59, 11, -17, 9, 0, 0, 0, -31, 0, -31],
    },
    {
      companyName: 'TDF2030',
      stockCountHistory: [53, 17, -17, 23, 0, -7, 0, -34, 0, -35],
    },
    {
      companyName: '금',
      stockCountHistory: [48, 15, -15, 18, 0, 0, 78, 94, 0, -238],
    },
    {
      companyName: '미국달러SOFR',
      stockCountHistory: [43, 27, -17, 20, 0, -18, 0, 0, 0, -55],
    },
    {
      companyName: '원화 CMA',
      stockCountHistory: [38, 12, -12, 17, -13, -4, 0, 82, 0, -120],
    },
    {
      companyName: '코스피',
      stockCountHistory: [35, 10, -11, 14, -12, 0, 0, 0, 0, -36],
    },
  ],
};

describe('포트폴리오 분석 계산 검증', () => {
  describe('포트폴리오 구성 비중 계산', () => {
    it('8년차 투자 비중을 올바르게 계산해요', () => {
      const result = calculatePortfolioAllocation(mockStock, mockUser, 8);

      // 총 포트폴리오 가치 확인
      const totalValue = result.companies.reduce((sum, company) => sum + company.value, 0);
      expect(totalValue).toBe(174_497_000);
      expect(result.isEmpty).toBe(false);

      // 예상 비중과 실제 비중 비교
      const expectedAllocations = {
        QQQ: 29.47,
        'S&P500': 7.03,
        TDF2030: 2.97,
        금: 23.46,
        미국달러SOFR: 3.56,
        비트코인: 10.3,
        '원화 CMA': 8.73,
        채권: 7.84,
        코스피: 3.14,
        해삐코인: 3.51,
      };

      // 각 회사별 비중 확인
      result.companies.forEach((company) => {
        const expected = expectedAllocations[company.name as keyof typeof expectedAllocations];
        const percentage = (company.value / totalValue) * 100;
        expect(percentage).toBeCloseTo(expected, 1);
      });

      // 총 비중이 100%인지 확인
      const totalPercentage = result.companies.reduce((sum, company) => {
        const percentage = (company.value / totalValue) * 100;
        return sum + percentage;
      }, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('보유 주식이 없는 연차에서 빈 포트폴리오를 반환해요', () => {
      // 0년차 이전 데이터를 위한 빈 사용자 데이터
      const emptyUser: User = {
        stockStorages: [
          {
            companyName: 'QQQ',
            stockCountHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
        ],
      };

      const result = calculatePortfolioAllocation(mockStock, emptyUser, 5);
      expect(result.isEmpty).toBe(true);
      expect(result.companies).toEqual([{ name: '보유 주식 없음', value: 1 }]);
    });
  });

  describe('누적 보유량 계산', () => {
    it('QQQ 8년차까지 누적 보유량을 올바르게 계산해요', () => {
      const qqq = mockUser.stockStorages.find((s) => s.companyName === 'QQQ')!;

      // QQQ 8년차까지 누적: 100+27-31+34+28+120+0+0+0 = 278주
      let cumulativeHolding = 0;
      for (let i = 0; i <= 8; i++) {
        cumulativeHolding += qqq.stockCountHistory[i] || 0;
      }
      expect(cumulativeHolding).toBe(278);
    });

    it('채권 8년차까지 누적 보유량을 올바르게 계산해요', () => {
      const bond = mockUser.stockStorages.find((s) => s.companyName === '채권')!;

      // 채권 8년차까지 누적: 90+27-29+38+0+0+0+0+0 = 126주
      let cumulativeHolding = 0;
      for (let i = 0; i <= 8; i++) {
        cumulativeHolding += bond.stockCountHistory[i] || 0;
      }
      expect(cumulativeHolding).toBe(126);
    });
  });

  describe('수익률 계산 (FIFO 방식)', () => {
    it('전체 포트폴리오 수익률을 올바르게 계산해요', () => {
      // 여러 연차의 수익률 확인
      const totalReturnsData = calculateTotalReturnsData(mockStock, mockUser);

      expect(totalReturnsData.returns).toHaveLength(10);
      expect(totalReturnsData.years).toHaveLength(10);

      // 첫 번째 연차 수익률이 계산되는지 확인
      expect(typeof totalReturnsData.returns[0]).toBe('number');
      expect(totalReturnsData.years[0]).toBe('0년차');
    });

    it('개별 회사 수익률을 올바르게 계산해요', () => {
      const qqq = mockUser.stockStorages.find((s) => s.companyName === 'QQQ')!;
      const qqqPrices = mockStock.companies.QQQ;

      // 0년차 수익률 계산: 첫 매수만 있으므로 0%
      const year0Return = calculateCompanyReturn(qqqPrices, qqq.stockCountHistory, 0);
      expect(year0Return).toBe(0);

      // 1년차 수익률 계산:
      // 투자액: 100주 * 100,000원 + 27주 * 115,000원 = 13,105,000원
      // 시장가치: 127주 * 115,000원 = 14,605,000원
      // 수익률: (14,605,000 - 13,105,000) / 13,105,000 * 100 = 11.4%
      const year1Return = calculateCompanyReturn(qqqPrices, qqq.stockCountHistory, 1);
      expect(year1Return).toBeCloseTo(11.4, 1);
    });
  });

  describe('통합 데이터 계산 함수들', () => {
    it('연차별 투자 데이터를 올바르게 생성해요', () => {
      const investmentData = calculateInvestmentData(mockStock, mockUser);

      expect(investmentData).toHaveLength(9); // 0~8년차
      expect(investmentData[0].year).toBe('0년차');
      expect(investmentData[8].year).toBe('8년차');

      // 각 연차마다 companies 배열이 있는지 확인
      investmentData.forEach((yearData) => {
        expect(Array.isArray(yearData.companies)).toBe(true);
        expect(yearData.companies.length).toBeGreaterThan(0);
      });
    });

    it('회사별 연차수익률 데이터를 올바르게 생성해요', () => {
      const returnsData = calculateReturnsData(mockStock, mockUser);

      expect(returnsData.years).toHaveLength(10); // 0~9년차
      expect(returnsData.companies.length).toBeGreaterThan(0);

      // 각 회사마다 10년치 데이터가 있는지 확인
      returnsData.companies.forEach((company) => {
        expect(company.data).toHaveLength(10);
        expect(typeof company.name).toBe('string');
      });
    });
  });
});
