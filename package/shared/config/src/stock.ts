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

export const getRandomCompanyNames = (length?: number): string[] => {
  const names = Object.keys(COMPANY_NAMES).map((key) => key);
  names.sort(() => Math.random() - 0.5);
  const result = names.splice(0, length ?? names.length);
  return result;
};
