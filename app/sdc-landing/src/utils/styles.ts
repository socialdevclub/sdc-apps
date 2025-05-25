import originalStyled, { CSSObject, StyledComponent } from '@emotion/styled';
import { css as emotionCSS } from '@emotion/react';
import { MEDIA_QUERY } from '../config/common';

type Props = Record<string, unknown>;

type StyleDefinition = CSSObject | string | ((props: Props) => CSSObject | string);

export type ResponsiveStyleConfig = {
  base?: StyleDefinition;
} & Partial<Record<keyof typeof MEDIA_QUERY, StyleDefinition>>;

function generateStyledComponent<Tag extends keyof JSX.IntrinsicElements>(
  tag: Tag,
): (
  configOrFn: ResponsiveStyleConfig | ((props: Props) => ResponsiveStyleConfig),
) => StyledComponent<Props, JSX.IntrinsicElements[Tag], object> {
  return (configOrFn: ResponsiveStyleConfig | ((props: Props) => ResponsiveStyleConfig)) => {
    return originalStyled(tag)((props: Props): (CSSObject | string)[] => {
      const resolvedConfig: ResponsiveStyleConfig = typeof configOrFn === 'function' ? configOrFn(props) : configOrFn;

      const finalStyles: (CSSObject | string)[] = [];

      const resolveStyle = (styleDef?: StyleDefinition): CSSObject | string | undefined => {
        if (typeof styleDef === 'function') {
          return styleDef(props);
        }
        return styleDef;
      };

      const baseStyle = resolveStyle(resolvedConfig.base);
      if (baseStyle) {
        finalStyles.push(baseStyle);
      }

      for (const [key, mediaQueryString] of Object.entries(MEDIA_QUERY)) {
        const breakpointKey = key as keyof typeof MEDIA_QUERY;
        const mqStyleDef = resolvedConfig[breakpointKey];

        if (mqStyleDef && mediaQueryString) {
          const specificStyle = resolveStyle(mqStyleDef);
          if (specificStyle) {
            finalStyles.push(emotionCSS`
              @media ${mediaQueryString} {
                ${specificStyle}
              }
            `);
          }
        }
      }
      return finalStyles;
    });
  };
}

export const responsiveStyled = {} as {
  [Tag in keyof JSX.IntrinsicElements]: ReturnType<typeof generateStyledComponent>;
};

const tagsToWrap: (keyof JSX.IntrinsicElements)[] = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
];

tagsToWrap.forEach((tag) => {
  responsiveStyled[tag] = generateStyledComponent(tag);
});

export { MEDIA_QUERY, emotionCSS as css, type CSSObject };
