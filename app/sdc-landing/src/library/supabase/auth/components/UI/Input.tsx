import { css } from '@stitches/core';
import { generateClassNames } from '@supabase/auth-ui-shared';
import { Appearance } from '../../types';

const inputDefaultStyles = css({
  '&::placeholder': {
    color: '$inputPlaceholder',
    letterSpacing: 'initial',
  },
  '&:focus': {
    borderColor: '$inputBorderFocus',
    outline: 'none',
  },
  '&:hover': {
    borderColor: '$inputBorderHover',
    outline: 'none',
  },
  background: '$inputBackground',
  borderColor: '$inputBorder',
  borderRadius: '$inputBorderRadius',
  borderStyle: 'solid',
  borderWidth: '$inputBorderWidth',
  boxSizing: 'border-box',
  color: '$inputText',
  cursor: 'text',
  fontFamily: '$inputFontFamily',
  fontSize: '$baseInputSize',
  padding: '$inputPadding',
  transitionDuration: '100ms',
  transitionProperty: 'background-color, border',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  variants: {
    type: {
      default: {
        letterSpacing: '0px',
      },
      password: {
        letterSpacing: '0px',
      },
    },
  },
  width: '100%',
});

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
  type: 'text' | 'password' | 'email';
  appearance?: Appearance;
}

const Input: React.FC<InputProps> = ({ children, appearance, ...props }) => {
  const classNames = generateClassNames(
    'input',
    inputDefaultStyles({
      type: props.type === 'password' ? 'password' : 'default',
    }),
    appearance,
  );

  return (
    // eslint-disable-next-line react/void-dom-elements-no-children
    <input {...props} style={appearance?.style?.input} className={classNames.join(' ')}>
      {children}
    </input>
  );
};

export { Input };
