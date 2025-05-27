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
      {parts.map((part) => {
        // 현재 부분과 일치하는 하이라이트 항목 찾기
        const matchingHighlight = highlights.find((h) => {
          if (typeof h === 'string') {
            return h.toLowerCase() === part.toLowerCase();
          }
          return h.text.toLowerCase() === part.toLowerCase();
        });

        // 일치하는 항목이 있으면 하이라이트 적용
        if (matchingHighlight) {
          const style = typeof matchingHighlight === 'string' ? {} : { color: matchingHighlight.color };

          return (
            <HighlightComponent key={part} style={style}>
              {part}
            </HighlightComponent>
          );
        }

        // 일치하는 항목이 없으면 일반 텍스트로 표시
        return <Fragment key={part}>{part}</Fragment>;
      })}
    </p>
  );
};

export default HighlightText;
