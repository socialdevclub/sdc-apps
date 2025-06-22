import styled from '@emotion/styled';
import { CSSProperties } from 'react';
import { applyResponsiveStyles } from '../../../../utils/styles';
import HighlightText from '../../../../common/HighlightText';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.p((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 38,
      marginBottom: `${props.theme.spacing.md}`,
    },
    base: {
      color: props.theme.colors.brand.primary,
      fontFamily: props.theme.fonts.subHeading,
      fontSize: 24,
      fontWeight: 500,
      letterSpacing: -1,
      marginBottom: `${props.theme.spacing.xs}`,
    },
  }),
);

export const Description = styled(HighlightText)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 32,
      marginBottom: 64,
      whiteSpace: 'pre-line',
    },
    base: {
      fontSize: 18,
      lineHeight: '150%',
      marginBottom: `${props.theme.spacing.xl3}`,
      textAlign: 'center',
      whiteSpace: 'pre-line',
      wordBreak: 'keep-all',
    },
  }),
);

export const CardContainer = styled.div((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      gap: `${props.theme.spacing.xl} ${props.theme.spacing.md}`,
      marginBottom: 56,
    },
    base: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: props.theme.spacing.xl3,
      justifyContent: 'center',
      marginBottom: 40,
      maxWidth: '1080px',
      padding: `0 ${props.theme.spacing.md}`,
      width: '100%',
    },
  }),
);

const CardWrapper = styled.div((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      flex: `0 1 calc(33.333% - ${props.theme.spacing.xl})`,
    },
    base: {
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 12,
      boxShadow: props.theme.dropShadow,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
  }),
);

const CardContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
`;

const CardBadge = styled.div<{ color: CSSProperties['color'] }>(({ color, theme }) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 16,
    },
    base: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 8,
      color,
      fontSize: 14,
      fontWeight: 'bold',
      left: theme.spacing.md,
      padding: `${theme.spacing.xs} ${theme.spacing.md}`,
      position: 'absolute',
      top: theme.spacing.md,
    },
  }),
);

const CardTextBox = styled.div((props) =>
  applyResponsiveStyles({
    base: {
      display: 'flex',
      flexDirection: 'column',
      gap: props.theme.spacing.xs,
      padding: props.theme.spacing.md,
      position: 'relative',
      width: '100%',
    },
  }),
);

const CardTitle = styled.p(() =>
  applyResponsiveStyles({
    base: {
      color: 'black',
      fontSize: 20,
      fontWeight: 'bold',
    },
  }),
);

const CardText = styled.p((props) =>
  applyResponsiveStyles({
    base: {
      WebkitBoxOrient: 'vertical',
      color: props.theme.colors.font['2'],
      display: '-webkit-box',
      fontSize: 16,
      lineHeight: '150%',
      whiteSpace: 'pre-line',
    },
  }),
);

export const Card = Object.assign(CardWrapper, {
  Badge: CardBadge,
  Content: CardContent,
  Image: CardImage,
  Text: CardText,
  TextBox: CardTextBox,
  Title: CardTitle,
});

export const MoreButton = styled.button((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 24,
      marginBottom: 240,
    },
    base: {
      alignItems: 'center',
      border: `1px solid ${props.theme.colors.brand.primary}`,
      borderRadius: 12,
      color: props.theme.colors.brand.primary,
      display: 'flex',
      fontSize: 16,
      fontWeight: 'bold',
      justifyContent: 'center',
      marginBottom: 100,
      maxWidth: 178,
      padding: props.theme.spacing.sm,
      width: '100%',
    },
  }),
);
