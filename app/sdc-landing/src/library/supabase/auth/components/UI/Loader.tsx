import { css } from '@stitches/core';
import { generateClassNames } from '@supabase/auth-ui-shared';
import { Appearance } from '../../types';

const loaderDefaultStyles = css({
  '&:after': {
    borderRadius: '50%',
    height: '10em',
    width: '10em',
  },
  '-ms-transform': 'translateZ(0)',
  '-webkit-animation': 'load8 1.1s infinite linear',
  '-webkit-transform': 'translateZ(0)',
  animation: 'load8 1.1s infinite linear',
  borderBottom: '1.1em solid rgba(255, 255, 255, 0.2)',
  borderLeft: '1.1em solid #ffffff',

  borderRadius: '50%',
  borderRight: '1.1em solid rgba(255, 255, 255, 0.2)',
  borderTop: '1.1em solid rgba(255, 255, 255, 0.2)',
  fontSize: '10px',

  height: '10em',
  margin: '60px auto',
  position: 'relative',
  textIndent: '-9999em',
  transform: 'translateZ(0)',

  width: '10em',

  // @-webkit-keyframes load8 {
  //   0% {
  //     -webkit-transform: rotate(0deg);
  //     transform: rotate(0deg);
  //   }
  //   100% {
  //     -webkit-transform: rotate(360deg);
  //     transform: rotate(360deg);
  //   }
  // }
  // @keyframes load8 {
  //   0% {
  //     -webkit-transform: rotate(0deg);
  //     transform: rotate(0deg);
  //   }
  //   100% {
  //     -webkit-transform: rotate(360deg);
  //     transform: rotate(360deg);
  //   }
  // }
});

export interface LoaderProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  appearance?: Appearance;
}

function Loader({ appearance, ...props }: LoaderProps) {
  const classNames = generateClassNames('loader', loaderDefaultStyles(), appearance);

  return <div {...props} style={appearance?.style?.loader} className={classNames.join(' ')} />;
}

export { Loader };
