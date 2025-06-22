import styled from '@emotion/styled';
import { applyResponsiveStyles } from '../../../../utils/styles';
import HighlightText from '../../../../common/HighlightText';

export const Container = styled(HighlightText)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '24px',
      padding: `${props.theme.spacing.xl3} ${props.theme.spacing.xs}`,
    },
    base: {
      backgroundColor: '#111111',
      fontSize: '16px',
      fontWeight: 500,
      padding: `${props.theme.spacing.xl} ${props.theme.spacing.xs}`,
      textAlign: 'center',
    },
  }),
);
