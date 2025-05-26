import styled from '@emotion/styled';
import { applyResponsiveStyles } from '../../../../utils/styles';
import HighlightText from '../../../../component/HighlightTex';

export const Container = styled(HighlightText)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '24px',
    },
    base: {
      alignItems: 'center',
      backgroundColor: '#111111',
      display: 'flex',
      fontSize: '16px',
      fontWeight: 500,
      justifyContent: 'center',
      padding: `${props.theme.spacing.xl} ${props.theme.spacing.xs}`,
    },
  }),
);
