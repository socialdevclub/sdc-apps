import { css, CSSObject } from '@emotion/react';
import { MEDIA_QUERY } from '../config/common';

type Breakpoint = keyof typeof MEDIA_QUERY;
type ResponsiveStylesConfig = {
  base: CSSObject;
} & Partial<Record<Breakpoint, CSSObject>>;

export const applyResponsiveStyles = (config: ResponsiveStylesConfig): CSSObject => {
  let stylesOutput = css(config.base);

  for (const key in MEDIA_QUERY) {
    if (Object.prototype.hasOwnProperty.call(MEDIA_QUERY, key)) {
      const breakpoint = key as Breakpoint;
      const breakpointStyle = config[breakpoint];
      if (breakpointStyle && MEDIA_QUERY[breakpoint]) {
        stylesOutput = css`
          ${stylesOutput}
          @media ${MEDIA_QUERY[breakpoint]} {
            ${css(breakpointStyle)}
          }
        `;
      }
    }
  }
  return stylesOutput;
};
