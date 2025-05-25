import styled from '@emotion/styled';
import { responsiveStyled } from '../../../../utils/styles';
import { CustomTheme } from '../../../../styles/theme';

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

export const TitleText = responsiveStyled.span({
  DESKTOP: `font-size: 64px`,
  base: `
    font-family: 'Helvetica Neue LT Pro 83 HvEx', sans-serif;
    font-size: 28px;
    font-weight: bold;
    letter-spacing: -2px;
    line-height: 135%;
    white-space: nowrap;`,
});

export const SubTitle = responsiveStyled.p({
  DESKTOP: `
    font-size: 32px;
    margin-top: 24px;
  `,
  base: `
    font-size: 18px;
    line-height: 150%;
    margin-top: 12px;`,
});

export const GamepadImage = responsiveStyled.img({
  DESKTOP: `
    width: 80px;
    margin: 0 10px;
    top: 5px`,
  base: `
    width: 35.6px;
    position: relative;`,
});

export const ChatImage = responsiveStyled.img({
  DESKTOP: `
    width: 70px;
    margin: 0 10px;
    bottom: 0;
    top: 5px`,
  base: `
    width: 34px;
    position: relative;
    bottom: 5px;`,
});

export const PurpleText = styled.span<{ fontFamily?: keyof CustomTheme['fonts'] }>(({ theme, fontFamily }) => ({
  color: theme.colors.brand.lightPurple,
  fontFamily: theme.fonts[fontFamily || 'main'],
  fontWeight: 'bold',
}));

export const TealText = styled.span(({ theme }) => ({
  color: theme.colors.brand.primary,
  fontFamily: theme.fonts.DungGeunMo,
}));

export const DevWrapper = responsiveStyled.div({
  DESKTOP: `font-size: 64px`,
  base: `
    font-size: 28px;
    font-family: 'Helvetica Neue LT Pro 83 HvEx', sans-serif;
    font-weight: bold;
    margin-right: 10px;`,
});

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
