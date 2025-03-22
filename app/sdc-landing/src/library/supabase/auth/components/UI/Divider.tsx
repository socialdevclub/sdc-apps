import { css } from '@stitches/core';
import { generateClassNames } from '@supabase/auth-ui-shared';
import { Appearance } from '../../types';

const dividerDefaultStyles = css({
  background: '$dividerBackground',
  display: 'block',
  height: '1px',
  margin: '16px 0',
  width: '100%',
});

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  appearance?: Appearance;
}

const Divider: React.FC<DividerProps> = ({ children, appearance, ...props }) => {
  const classNames = generateClassNames('divider', dividerDefaultStyles(), appearance);

  return <div {...props} style={appearance?.style?.divider} className={classNames.join(' ')} />;
};

export { Divider };
