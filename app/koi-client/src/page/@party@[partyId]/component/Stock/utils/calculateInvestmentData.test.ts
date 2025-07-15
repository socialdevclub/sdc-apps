import { describe, it, expect } from 'vitest';
import type { Response, StockSchemaWithId } from 'shared~type-stock';
import { calculateInvestmentData } from './calculateInvestmentData';
import { MOCK_STOCK, MOCK_USER } from '../__mock__';

// 타입 호환성을 위한 헬퍼
const mockStock = MOCK_STOCK as unknown as StockSchemaWithId;
const mockUser = MOCK_USER as unknown as Response.GetStockUser;

describe('calculateInvestmentData', () => {
  it('0~8년차의 연차별 포트폴리오 구성 데이터를 정확히 계산해요', () => {
    const result = calculateInvestmentData(mockStock, mockUser);

    // 9개의 연차 데이터가 반환되는지 확인
    expect(result).toHaveLength(9);

    // 각 연차 데이터 구조 확인
    result.forEach((yearData, index) => {
      expect(yearData).toHaveProperty('year', `${index}년차`);
      expect(yearData).toHaveProperty('companies');
      expect(Array.isArray(yearData.companies)).toBe(true);
    });
  });

  it('0년차에는 모든 회사의 초기 투자 데이터를 반환해요', () => {
    const result = calculateInvestmentData(mockStock, mockUser);
    const year0Data = result[0];

    expect(year0Data.year).toBe('0년차');
    expect(year0Data.companies.length).toBeGreaterThan(0);

    // 각 회사의 데이터 구조 확인
    year0Data.companies.forEach((company) => {
      expect(company).toHaveProperty('name');
      expect(company).toHaveProperty('value');
      expect(typeof company.name).toBe('string');
      expect(typeof company.value).toBe('number');
      expect(company.value).toBeGreaterThanOrEqual(0);
    });
  });

  it('마지막 연차(8년차)의 포트폴리오 구성을 정확히 계산해요', () => {
    const result = calculateInvestmentData(mockStock, mockUser);
    const lastYearData = result[8];

    expect(lastYearData.year).toBe('8년차');
    expect(lastYearData.companies).toBeDefined();

    // 보유 주식이 있는 경우 value가 양수여야 함
    lastYearData.companies.forEach((company) => {
      if (company.name !== '보유 주식 없음') {
        expect(company.value).toBeGreaterThan(0);
      }
    });
  });

  it('빈 사용자 데이터에 대해 적절히 처리해요', () => {
    const emptyUser = { stockStorages: [] } as unknown as Response.GetStockUser;
    const result = calculateInvestmentData(mockStock, emptyUser);

    expect(result).toHaveLength(9);

    // 모든 연차에 대해 '보유 주식 없음' 상태여야 함
    result.forEach((yearData) => {
      expect(yearData.companies).toEqual([{ name: '보유 주식 없음', value: 1 }]);
    });
  });

  it('특정 회사만 거래한 경우 해당 회사 데이터만 포함해요', () => {
    const singleCompanyUser = {
      stockStorages: [
        {
          companyName: 'QQQ',
          stockCountHistory: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    } as unknown as Response.GetStockUser;

    const result = calculateInvestmentData(mockStock, singleCompanyUser);
    const year0Data = result[0];

    expect(year0Data.companies).toHaveLength(1);
    expect(year0Data.companies[0].name).toBe('QQQ');
    expect(year0Data.companies[0].value).toBe(100 * 100000); // 100주 * 100,000원
  });

  it('매도로 인해 보유량이 0이 된 회사는 포트폴리오에서 제외돼요', () => {
    const soldOutUser = {
      stockStorages: [
        {
          companyName: 'QQQ',
          stockCountHistory: [100, 0, -100, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    } as unknown as Response.GetStockUser;

    const result = calculateInvestmentData(mockStock, soldOutUser);
    const year2Data = result[2];

    // 2년차에는 모든 주식을 매도했으므로 '보유 주식 없음'이어야 함
    expect(year2Data.companies).toEqual([{ name: '보유 주식 없음', value: 1 }]);
  });
});
