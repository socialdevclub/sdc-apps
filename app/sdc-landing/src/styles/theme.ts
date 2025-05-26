// src/styles/theme.ts

export interface CustomTheme {
  colors: {
    brand: {
      primary: string;
      secondary: string;
      lightPurple: string;
    };
    font: {
      1: string;
      2: string;
      3: string;
      4: string;
    };
  };
  fonts: {
    main: string;
    heading: string;
    subHeading: string;
    DungGeunMo: string;
  };
  spacing: {
    xs2: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xl2: string;
    xl3: string;
  };

  dropShadow: string;
}

export const theme: CustomTheme = {
  colors: {
    brand: {
      lightPurple: '#AE94FF',
      primary: '#06DEDD',
      secondary: '#6339E3',
    },
    font: {
      1: '#6B7280',
      2: '#454545',
      3: '#F3F4F6',
      4: '#0EA5E9',
    },
  },
  dropShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  fonts: {
    DungGeunMo: 'DungGeunMo',
    heading: "'Helvetica Neue LT Pro 83 HvEx', sans-serif",
    main: 'Pretendard, sans-serif',
    subHeading: "'Helvetica Neue LT Pro 53 Ex', sans-serif",
  },
  spacing: {
    lg: '20px',
    md: '16px',
    sm: '12px',
    xl: '24px',
    xl2: '28px',
    xl3: '32px',
    xs: '8px',
    xs2: '4px',
  },
};

// Emotion의 Theme 타입을 확장하기 위한 선언 (TypeScript 사용 시)
// @emotion/react 모듈에 CustomTheme 타입을 알려줍니다.
declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends CustomTheme {}
}
