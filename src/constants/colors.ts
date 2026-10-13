export const primaryScale = {
  100: '#FFD5DD',
  200: '#FFABBB',
  300: '#FF8199',
  400: '#FF5777',
  500: '#FF2D55',
  600: '#CC2444',
  700: '#991B33',
  800: '#661222',
  900: '#330911',
};

export const accentScale = {
  100: '#FFFACC',
  200: '#FFF599',
  300: '#FFF066',
  400: '#FFEB33',
  500: '#FFE600',
  600: '#CCB800',
  700: '#998A00',
  800: '#665C00',
  900: '#332E00',
};

export const backgroundScale = {
  100: '#E1E3E6',
  200: '#C4C7CC',
  300: '#A6AAB3',
  400: '#898E99',
  500: '#6B7280',
  600: '#565B66',
  700: '#40444D',
  800: '#2B2E33',
  900: '#15171A',
};

export const successScale = {
  100: '#CFF1E6',
  200: '#9FE3CD',
  300: '#70D5B3',
  400: '#40C79A',
  500: '#10B981',
  600: '#0D9467',
  700: '#0A6F4D',
  800: '#064A34',
  900: '#03251A',
};

export const errorScale = {
  100: '#FCDADA',
  200: '#F9B4B4',
  300: '#F58F8F',
  400: '#F26969',
  500: '#EF4444',
  600: '#BF3636',
  700: '#8F2929',
  800: '#601B1B',
  900: '#300E0E',
};

export const warningScale = {
  100: '#FDECCE',
  200: '#FBD89D',
  300: '#F9C56D',
  400: '#F7B13C',
  500: '#F59E0B',
  600: '#C47E09',
  700: '#935F07',
  800: '#623F04',
  900: '#312002',
};

export const infoScale = {
  100: '#D8E6FD',
  200: '#B1CDFB',
  300: '#89B4FA',
  400: '#629BF8',
  500: '#3B82F6',
  600: '#2F68C5',
  700: '#234E94',
  800: '#183462',
  900: '#0C1A31',
};

const white = '#FFFFFF';
const almostBlack = '#171717';
const almostWhite = '#FAFAFA';

export const Colors = {
  light: {
    primary: primaryScale[500],
    primaryForeground: almostWhite,
    accent: accentScale[500],
    accentForeground: almostBlack,
    success: successScale[500],
    successForeground: almostWhite,
    error: errorScale[500],
    errorForeground: almostWhite,
    warning: warningScale[500],
    warningForeground: almostBlack,
    info: infoScale[500],
    infoForeground: almostWhite,

    screenBackground: white,
    foreground: backgroundScale[900],

    card: white,
    cardForeground: backgroundScale[900],
    popover: white,
    popoverForeground: backgroundScale[900],
    muted: backgroundScale[100],
    mutedForeground: backgroundScale[500],
    border: backgroundScale[200],
    input: backgroundScale[200],
    ring: primaryScale[500],
    destructive: errorScale[500],
    destructiveForeground: almostWhite,

    chart1: primaryScale[500],
    chart2: successScale[500],
    chart3: infoScale[500],
    chart4: accentScale[500],
    chart5: warningScale[500],
  },
  dark: {
    primary: primaryScale[400],
    primaryForeground: almostWhite,
    accent: accentScale[500],
    accentForeground: almostBlack,
    success: successScale[500],
    successForeground: almostWhite,
    error: errorScale[500],
    errorForeground: almostWhite,
    warning: warningScale[500],
    warningForeground: almostBlack,
    info: infoScale[500],
    infoForeground: almostWhite,

    screenBackground: backgroundScale[900],
    foreground: backgroundScale[100],

    card: backgroundScale[800],
    cardForeground: backgroundScale[100],
    popover: backgroundScale[800],
    popoverForeground: backgroundScale[100],
    muted: backgroundScale[700],
    mutedForeground: backgroundScale[400],
    border: backgroundScale[700],
    input: backgroundScale[700],
    ring: primaryScale[400],
    destructive: errorScale[500],
    destructiveForeground: almostWhite,

    chart1: '#266ED9',
    chart2: '#2EB88A',
    chart3: '#E88C30',
    chart4: '#AF57DB',
    chart5: '#E2366F',
  },
};

export type ThemeColors = typeof Colors.light;

export const radius = 8;
