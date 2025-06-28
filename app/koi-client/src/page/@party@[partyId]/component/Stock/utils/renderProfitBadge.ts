export const renderProfitBadge = (
  stockProfitRate: number | null,
): { backgroundColor: string; color: string; text: string } => {
  if (stockProfitRate === null) {
    return {
      backgroundColor: 'rgba(148, 163, 184, 0.2)',
      color: '#94A3B8',
      text: '해당 주식이 없어요',
    };
  }
  if (stockProfitRate > 0) {
    return {
      backgroundColor: 'rgba(163, 230, 53, 0.2)',
      color: '#a3e635',
      text: `+${stockProfitRate}% 수익 중`,
    };
  }
  if (stockProfitRate < 0) {
    return {
      backgroundColor: 'rgba(220, 38, 38, 0.2)',
      color: '#DC2626',
      text: `${stockProfitRate}% 손실 중`,
    };
  }
  return {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    color: '#94A3B8',
    text: '0% 변동 없음',
  };
};
