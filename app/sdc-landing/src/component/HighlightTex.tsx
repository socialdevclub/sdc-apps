import { Fragment } from 'react';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HighlightMultipleProps {
  text: string;
  highlights: string[];
  HighlightComponent?: React.ElementType;
}

export const HighlightText: React.FC<HighlightMultipleProps> = ({
  text,
  highlights,
  HighlightComponent = 'strong',
  ...props
}) => {
  if (highlights.length === 0) return <>{text}</>;

  const escapedHighlights = highlights.map(escapeRegExp);
  const regex = new RegExp(`(${escapedHighlights.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <p {...props}>
      {parts.map((part) =>
        highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
          <HighlightComponent key={part}>{part}</HighlightComponent>
        ) : (
          <Fragment key={part}>{part}</Fragment>
        ),
      )}
    </p>
  );
};

export default HighlightText;
