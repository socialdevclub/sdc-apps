import { Fragment } from 'react';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HighlightMultipleProps {
  text: string;
  highlights: string[] | { text: string; color: string }[];
  HighlightComponent?: React.ElementType;
  strict?: boolean;
}

// 고유한 키 생성을 위한 함수
function generateUniqueKey(part: string, position: number): string {
  // 텍스트 내용과 위치를 조합하여 고유한 키 생성
  return `highlight-${position}-${part.length}-${part.substring(0, 8).replace(/\s/g, '_')}`;
}

export const HighlightText = ({
  text,
  highlights,
  HighlightComponent = 'strong',
  strict = false,
  ...props
}: HighlightMultipleProps) => {
  if (highlights.length === 0) return <p {...props}>{text}</p>;

  const escapedHighlights = highlights.map((h) => {
    if (typeof h === 'string') {
      return escapeRegExp(h);
    }
    return escapeRegExp(h.text);
  });
  const regex = new RegExp(`(${escapedHighlights.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <p {...props}>
      {parts.map((part, position) => {
        // 현재 부분과 일치하는 하이라이트 항목 찾기
        const matchingHighlight = highlights.find((h) => {
          // strict의 경우 대소문자 구분
          if (strict) {
            if (typeof h === 'string') {
              return h === part;
            }
            return h.text === part;
          }

          if (typeof h === 'string') {
            return h.toLowerCase() === part.toLowerCase();
          }

          return h.text.toLowerCase() === part.toLowerCase();
        });

        // 고유한 키 생성
        const uniqueKey = generateUniqueKey(part, position);

        // 일치하는 항목이 있으면 하이라이트 적용
        if (matchingHighlight) {
          const style = typeof matchingHighlight === 'string' ? {} : { color: matchingHighlight.color };

          return (
            <HighlightComponent key={uniqueKey} style={style}>
              {part}
            </HighlightComponent>
          );
        }

        // 일치하는 항목이 없으면 일반 텍스트로 표시
        return <Fragment key={uniqueKey}>{part}</Fragment>;
      })}
    </p>
  );
};

export default HighlightText;
