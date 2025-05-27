import styled from '@emotion/styled';
import { applyResponsiveStyles } from '../../../../utils/styles';
import HighlightTextt from '../../../../component/HighlightText';

export const Container = styled(HighlightTextt)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '24px',
      padding: `${props.theme.spacing.xl3} ${props.theme.spacing.xs}`,
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
