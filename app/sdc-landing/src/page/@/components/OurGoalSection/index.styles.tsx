import styled from '@emotion/styled';
import { applyResponsiveStyles } from '../../../../utils/styles';
import HighlightText from '../../../../component/HighlightTex';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.p((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 40,
      marginBottom: `${props.theme.spacing.md}`,
    },
    base: {
      color: props.theme.colors.brand.primary,
      fontFamily: props.theme.fonts.subHeading,
      fontSize: 18,
      marginBottom: `${props.theme.spacing.xs}`,
    },
  }),
);

export const Description = styled(HighlightText)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 32,
      marginBottom: 72,
      whiteSpace: 'pre-line',
    },
    base: {
      fontSize: 18,
      lineHeight: '150%',
      marginBottom: `${props.theme.spacing.xl3}`,
      padding: `0 ${props.theme.spacing.xl}`,
      textAlign: 'center',
      wordBreak: 'keep-all',
    },
  }),
);

export const CardWrapper = styled.div(() =>
  applyResponsiveStyles({
    DESKTOP: {
      gap: 60,
    },
    base: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 24,
    },
  }),
);

export const Card = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const CardText = styled(HighlightText)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 24,
      lineHeight: '130%',
    },
    base: {
      fontSize: 16,
      lineHeight: '140%',
      textAlign: 'center',
      whiteSpace: 'pre',
    },
  }),
);

export const CardImage = styled.img(() =>
  applyResponsiveStyles({
    DESKTOP: {
      width: 200,
    },
    base: {
      width: 120,
    },
  }),
);
