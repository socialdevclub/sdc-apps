import styled from '@emotion/styled';
import { applyResponsiveStyles } from '../../../../utils/styles';

export const Container = styled.div((props) =>
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

export const ColorText = styled.span`
  color: ${(props) => props.theme.colors.brand.primary};
`;
