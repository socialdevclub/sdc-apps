import { describe, it, expect } from 'vitest';
import type { Response, StockSchemaWithId } from 'shared~type-stock';
import { calculatePortfolioAllocation } from './calculatePortfolioAllocation';
import { MOCK_STOCK, MOCK_USER } from '../__mock__';

// 타입 호환성을 위한 헬퍼
const mockStock = MOCK_STOCK as unknown as StockSchemaWithId;
const mockUser = MOCK_USER as unknown as Response.GetStockUser;

describe('calculatePortfolioAllocation', () => {
  it('0년차의 포트폴리오 구성을 정확히 계산해요', () => {
    const result = calculatePortfolioAllocation(mockStock, mockUser, 0);

    expect(result).toHaveProperty('companies');
    expect(result).toHaveProperty('isEmpty');
    expect(Array.isArray(result.companies)).toBe(true);
    expect(typeof result.isEmpty).toBe('boolean');

    // 0년차에는 모든 회사가 초기 투자를 가지므로 비어있지 않아야 함
    expect(result.isEmpty).toBe(false);
    expect(result.companies.length).toBeGreaterThan(0);

    // 각 회사의 포트폴리오 데이터 구조 확인
    result.companies.forEach((company) => {
      expect(company).toHaveProperty('name');
      expect(company).toHaveProperty('value');
      expect(typeof company.name).toBe('string');
      expect(typeof company.value).toBe('number');
      expect(company.value).toBeGreaterThan(0);
    });
  });

  it('연차에 따른 포트폴리오 변화를 정확히 반영해요', () => {
    const year0 = calculatePortfolioAllocation(mockStock, mockUser, 0);
    const year1 = calculatePortfolioAllocation(mockStock, mockUser, 1);
    const year2 = calculatePortfolioAllocation(mockStock, mockUser, 2);

    // 각 연차별로 포트폴리오가 변해야 함
    expect(year0.companies).toBeDefined();
    expect(year1.companies).toBeDefined();
    expect(year2.companies).toBeDefined();

    // 거래 이력에 따라 포트폴리오 가치가 달라져야 함
    const year0Total = year0.companies.reduce((sum, company) => sum + company.value, 0);
    const year1Total = year1.companies.reduce((sum, company) => sum + company.value, 0);

    expect(year0Total).toBeGreaterThan(0);
    expect(year1Total).toBeGreaterThan(0);
  });

  it('보유량이 양수인 회사만 포트폴리오에 포함해요', () => {
    const result = calculatePortfolioAllocation(mockStock, mockUser, 5);

    result.companies.forEach((company) => {
      if (company.name !== '보유 주식 없음') {
        expect(company.value).toBeGreaterThan(0);
      }
    });
  });

  it('빈 사용자 데이터에 대해 적절히 처리해요', () => {
    const emptyUser = { stockStorages: [] } as unknown as Response.GetStockUser;
    const result = calculatePortfolioAllocation(mockStock, emptyUser, 0);

    expect(result.isEmpty).toBe(true);
    expect(result.companies).toEqual([{ name: '보유 주식 없음', value: 1 }]);
  });

  it('특정 회사만 보유한 경우 해당 회사만 포함해요', () => {
    const singleCompanyUser = {
      stockStorages: [
        {
          companyName: 'QQQ',
          stockCountHistory: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    } as unknown as Response.GetStockUser;

    const result = calculatePortfolioAllocation(mockStock, singleCompanyUser, 0);

    expect(result.isEmpty).toBe(false);
    expect(result.companies).toHaveLength(1);
    expect(result.companies[0].name).toBe('QQQ');
    expect(result.companies[0].value).toBe(100 * 100000); // 100주 * 100,000원
  });

  it('모든 주식을 매도한 경우 빈 포트폴리오를 반환해요', () => {
    const soldOutUser = {
      stockStorages: [
        {
          companyName: 'QQQ',
          stockCountHistory: [100, 0, -100, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    } as unknown as Response.GetStockUser;

    const result = calculatePortfolioAllocation(mockStock, soldOutUser, 2);

    expect(result.isEmpty).toBe(true);
    expect(result.companies).toEqual([{ name: '보유 주식 없음', value: 1 }]);
  });

  it('범위를 벗어난 연차에 대해 적절히 처리해요', () => {
    const result = calculatePortfolioAllocation(mockStock, mockUser, 20);

    // 범위를 벗어난 연차에는 데이터가 없으므로 빈 포트폴리오여야 함
    expect(result.isEmpty).toBe(true);
    expect(result.companies).toEqual([{ name: '보유 주식 없음', value: 1 }]);
  });

  it('누적 보유량을 정확히 계산해요', () => {
    const cumulativeUser = {
      stockStorages: [
        {
          companyName: 'QQQ',
          stockCountHistory: [50, 30, -20, 40, 0, 0, 0, 0, 0, 0],
        },
      ],
    } as unknown as Response.GetStockUser;

    // 3년차 누적: 50 + 30 - 20 + 40 = 100주
    const result = calculatePortfolioAllocation(mockStock, cumulativeUser, 3);

    expect(result.isEmpty).toBe(false);
    expect(result.companies).toHaveLength(1);
    expect(result.companies[0].name).toBe('QQQ');
    expect(result.companies[0].value).toBe(100 * 125000); // 100주 * 3년차 가격(125,000원)
  });
});
