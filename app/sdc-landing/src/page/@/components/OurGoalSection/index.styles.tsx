import styled from '@emotion/styled';
import { applyResponsiveStyles } from '../../../../utils/styles';
import HighlightText from '../../../../component/HighlightTex';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.p`
  font-size: 24px;
  font-family: ${(props) => props.theme.fonts.subHeading};
  padding-bottom: ${(props) => props.theme.spacing.xs};
  color: ${(props) => props.theme.colors.brand.primary};
`;

export const Description = styled(HighlightText)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '24px',
      whiteSpace: 'pre-line',
    },
    base: {
      fontSize: '18px',
      lineHeight: '150%',
      marginBottom: `${props.theme.spacing.xl3}`,
      padding: `0 ${props.theme.spacing.xl}`,
      textAlign: 'center',
      wordBreak: 'keep-all',
    },
  }),
);

export const CardWrapper = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

export const Card = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const CardText = styled(HighlightText)`
  font-size: 16px;
  line-height: 140%;
  text-align: center;
  white-space: pre-line;
`;

export const CardImage = styled.img`
  width: 120px;
`;
