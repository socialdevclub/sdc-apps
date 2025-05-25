import styled from '@emotion/styled';
import { CustomTheme } from '../../../../styles/theme';
import { applyResponsiveStyles } from '../../../../utils/styles';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  background-color: #000000;
  color: white;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const TitleText = styled.span((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '64px',
    },
    base: {
      fontFamily: props.theme.fonts.heading,
      fontSize: '28px',
      fontWeight: 'bold',
      letterSpacing: '-2px',
      lineHeight: '135%',
      whiteSpace: 'nowrap',
    },
  }),
);

export const SubTitle = styled.p(
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '32px',
      marginTop: '24px',
    },
    base: {
      fontSize: '18px',
      lineHeight: '150%',
      marginTop: '12px',
    },
  }),
);

export const GamepadImage = styled.img(
  applyResponsiveStyles({
    DESKTOP: {
      width: '80px',
    },
    base: {
      width: '35.6px',
    },
  }),
);

export const ChatImage = styled.img(
  applyResponsiveStyles({
    DESKTOP: {
      width: '70px',
    },
    base: {
      bottom: '5px',
      width: '34px',
    },
  }),
);

export const PurpleText = styled.span<{ fontFamily?: keyof CustomTheme['fonts'] }>(({ theme, fontFamily }) => ({
  color: theme.colors.brand.lightPurple,
  fontFamily: theme.fonts[fontFamily || 'main'],
  fontWeight: 'bold',
}));

export const TealText = styled.span(({ theme }) => ({
  color: theme.colors.brand.primary,
  fontFamily: theme.fonts.DungGeunMo,
}));

export const DevWrapper = styled.div((props) =>
  applyResponsiveStyles({
    DESKTOP: {
      fontSize: '64px',
    },
    base: {
      fontFamily: props.theme.fonts.heading,
      fontSize: '28px',
      fontWeight: 'bold',
    },
  }),
);

export const ButtonWrapper = styled.div`
  margin-top: 24px;
`;

export const Button = styled.button`
  background-color: ${(props) => props.theme.colors.brand.primary};
  color: black;
  border-radius: 4px;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.xl};
  font-weight: bold;
  font-size: 16px;
`;
