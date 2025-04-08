import { css } from '@stitches/core';
import { generateClassNames } from '@supabase/auth-ui-shared';
import { Appearance } from '../../types';

const labelDefaultStyles = css({
  color: '$inputLabelText',
  display: 'block',
  fontFamily: '$labelFontFamily',
  fontSize: '$baseLabelSize',
  marginBottom: '$labelBottomMargin',
});

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  appearance?: Appearance;
}

const Label: React.FC<LabelProps> = ({ children, appearance, ...props }) => {
  const classNames = generateClassNames('label', labelDefaultStyles(), appearance);

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label {...props} style={appearance?.style?.label} className={classNames.join(' ')}>
      {children}
    </label>
  );
};

export { Label };
