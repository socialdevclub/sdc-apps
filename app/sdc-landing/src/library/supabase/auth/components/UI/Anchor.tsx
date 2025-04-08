import { css } from '@stitches/core';
import { generateClassNames } from '@supabase/auth-ui-shared';
import { Appearance } from '../../types';

const anchorHTMLAttributes = css({
  '&:hover': {
    color: '$anchorTextHoverColor',
  },
  color: '$anchorTextColor',
  display: 'block',
  fontFamily: '$bodyFontFamily',
  fontSize: '$baseBodySize',
  marginBottom: '$anchorBottomMargin',
  textAlign: 'center',
  textDecoration: 'underline',
});

interface LabelProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  appearance?: Appearance;
}

const Anchor: React.FC<LabelProps> = ({ children, appearance, ...props }) => {
  const classNames = generateClassNames('anchor', anchorHTMLAttributes(), appearance);

  return (
    <a {...props} style={appearance?.style?.anchor} className={classNames.join(' ')}>
      {children}
    </a>
  );
};

export { Anchor };
