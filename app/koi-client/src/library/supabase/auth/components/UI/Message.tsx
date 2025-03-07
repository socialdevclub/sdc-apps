import { css } from '@stitches/core';
import { generateClassNames } from '@supabase/auth-ui-shared';
import { Appearance } from '../../types';

const messageDefaultStyles = css({
  backgroundColor: '$messageBackground',
  border: '1px solid $messageBorder',
  borderRadius: '0.375rem',
  color: '$messageText',
  display: 'block',
  fontFamily: '$bodyFontFamily',
  fontSize: '$baseInputSize',
  lineHeight: '1rem',
  marginBottom: '$labelBottomMargin',
  padding: '1.5rem 1rem',
  textAlign: 'center',
  variants: {
    color: {
      danger: {
        backgroundColor: '$messageBackgroundDanger',
        border: '1px solid $messageBorderDanger',
        color: '$messageTextDanger',
      },
    },
  },
});

interface MessageProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color?: 'danger';
  appearance?: Appearance;
}

const Message: React.FC<MessageProps> = ({ children, appearance, ...props }) => {
  const classNames = generateClassNames('message', messageDefaultStyles({ color: props.color }), appearance);

  return (
    <span {...props} style={appearance?.style?.message} className={classNames.join(' ')}>
      {children}
    </span>
  );
};

export { Message };
