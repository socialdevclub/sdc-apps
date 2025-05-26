import { Fragment } from 'react';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HighlightMultipleProps {
  text: string;
  highlights: string[] | { text: string; color: string }[];
  HighlightComponent?: React.ElementType;
}

export const HighlightText = ({
  text,
  highlights,
  HighlightComponent = 'strong',
  ...props
}: HighlightMultipleProps) => {
  if (highlights.length === 0) return <p {...props}>{text}</p>;

  // 하이라이트할 텍스트 주변의 공백을 포함하여 패턴 생성
  const escapedHighlights = highlights.map((h) => {
    if (typeof h === 'string') {
      return escapeRegExp(h);
    }
    return escapeRegExp(h.text);
  });

  // 공백을 포함하여 매칭하기 위해 패턴 수정
  // 정규식에서 \s*는 0개 이상의 공백을 의미
  const regex = new RegExp(`(\\s*(?:${escapedHighlights.join('|')})\\s*)`, 'gi');

  // 줄바꿈 처리를 위해 텍스트를 줄 단위로 분리
  const lines = text.split('\n');

  return (
    <p {...props}>
      {lines.map((line) => {
        const parts = line.split(regex);
        // 각 줄에 대한 고유 ID 생성
        const lineId = `line-${line.substring(0, 20).replace(/\s+/g, '-')}`;

        return (
          <Fragment key={lineId}>
            {parts.map((part) => {
              // 각 부분에 대한 고유 ID 생성
              const partId = `part-${part.substring(0, 20).replace(/\s+/g, '-')}`;

              // 현재 부분과 일치하는 하이라이트 항목 찾기
              const matchingHighlight = highlights.find((h) => {
                const highlightText = typeof h === 'string' ? h : h.text;
                // 공백을 제거하고 비교
                return (
                  part.trim().toLowerCase() === highlightText.toLowerCase() ||
                  part.trim().toLowerCase().includes(highlightText.toLowerCase())
                );
              });

              // 일치하는 항목이 있으면 하이라이트 적용
              if (matchingHighlight) {
                const color = typeof matchingHighlight === 'string' ? undefined : matchingHighlight.color;
                return (
                  <HighlightComponent key={`highlight-${partId}`} style={color ? { color } : undefined}>
                    {part}
                  </HighlightComponent>
                );
              }

              // 일치하는 항목이 없으면 일반 텍스트로 표시
              return <Fragment key={`text-${partId}`}>{part}</Fragment>;
            })}
            {/* 마지막 줄이 아니면 줄바꿈 추가 */}
            {line !== lines[lines.length - 1] && <br />}
          </Fragment>
        );
      })}
    </p>
  );
};

export default HighlightText;
