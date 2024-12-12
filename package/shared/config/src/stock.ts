export const COMPANY_NAMES = {
  '고양기획🐈': '고양기획🐈',
  '꿀벌생명🐝': '꿀벌생명🐝',
  '늑대통신🐺': '늑대통신🐺',
  '수달물산🦦': '수달물산🦦',
  '여우은행🦊': '여우은행🦊',
  '용용카드🐲': '용용카드🐲',
  '참새제과🐶': '강쥐제과🐶',
  '토끼건설🐰': '토끼건설🐰',
  '햄찌금융🐹': '햄찌금융🐹',
  '호랑전자🐯': '호랑전자🐯',
} as const;
export type CompanyNames = (typeof COMPANY_NAMES)[keyof typeof COMPANY_NAMES];

/**
 * 랜덤하게 회사 이름을 선택하여 반환하는 함수
 * @param {number} [length] - 반환할 회사 이름의 개수. 미지정시 전체 회사 반환. 최대 10까지
 * @returns {string[]} 선택된 회사 이름 배열
 */
export const getRandomCompanyNames = (length?: number): string[] => {
  const names = Object.keys(COMPANY_NAMES).map((key) => key);
  names.sort(() => Math.random() - 0.5);
  const result = names.splice(0, length ?? names.length);
  return result;
};

export const INIT_STOCK_PRICE = 100000;
