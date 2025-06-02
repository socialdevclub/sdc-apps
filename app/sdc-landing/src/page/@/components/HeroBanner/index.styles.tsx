import styled from '@emotion/styled';
import { CustomTheme } from '../../../../styles/theme';
import { applyResponsiveStyles } from '../../../../utils/styles';
import HighlightText from '../../../../common/HighlightText';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  background-color: #000000;
  color: white;
  flex: 1 1 0;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const TitleHighlightText = styled(HighlightText)((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '110px',
      paddingBottom: 0,
    },
    base: {
      fontFamily: (props as { theme: CustomTheme }).theme.fonts.heading,
      fontSize: '30px',
      fontWeight: 'bold',
      paddingBottom: props.theme.spacing.xs2,
      whiteSpace: 'nowrap',
    },
  }),
);
export const TitleText = styled.span((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '116px',
    },
    base: {
      fontFamily: (props as { theme: CustomTheme }).theme.fonts.heading,
      fontSize: '32px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },
  }),
);

export const SubTitle = styled(HighlightText)(() =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 36,
      marginTop: 36,
    },
    base: {
      fontSize: 18,
      lineHeight: '150%',
      marginTop: 18,
    },
  }),
);

export const GamepadImage = styled.img(
  applyResponsiveStyles({
    DESKTOP: {
      width: '134px',
    },
    base: {
      width: '36px',
    },
  }),
);

export const ChatImage = styled.img(
  applyResponsiveStyles({
    DESKTOP: {
      transform: 'translateY(15px)',
      width: '118px',
    },
    base: {
      width: '32px',
    },
  }),
);

export const PurpleText = styled.span<{ fontFamily?: keyof CustomTheme['fonts'] }>(({ theme, fontFamily }) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 112,
    },
    base: {
      color: theme.colors.brand.lightPurple,
      fontFamily: theme.fonts[fontFamily || 'main'],
      fontSize: 36,
      fontWeight: 'bold',
    },
  }),
);

export const TealText = styled.span(({ theme }) => ({
  color: theme.colors.brand.primary,
  fontFamily: theme.fonts.DungGeunMo,
}));

export const DevWrapper = styled.div((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '112px',
      padding: `0 ${props.theme.spacing.sm}`,
    },
    base: {
      fontFamily: props.theme.fonts.heading,
      fontSize: '30px',
      fontWeight: 'bold',
    },
  }),
);

export const ButtonWrapper = styled.div((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      marginTop: 64,
    },
    base: {
      marginTop: props.theme.spacing.xl,
    },
  }),
);

export const Button = styled.button((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: 30,
      padding: `${props.theme.spacing.md} 73px`,
    },
    base: {
      backgroundColor: props.theme.colors.brand.primary,
      border: `1px solid ${props.theme.colors.brand.primary}`,
      borderRadius: 12,
      color: 'black',
      fontSize: 16,
      fontWeight: 'bold',
      padding: `${props.theme.spacing.xs} ${props.theme.spacing.xl}`,
    },
  }),
);
