
import { moderateScale } from '../utils/responsive';

// Dark theme colors
export const DARK_COLORS = {
    accent: '#ACF532',
    cardBg: '#141414',
    red: '#ff0000',
    white: '#FFFFFF',
    background_White: '#dddddd',
    chart: "#353535ff",
    black: '#000000',
    gray: '#808080',
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#dddddd',
    border: '#ffffff31',
    chartColors: ['#375fff', '#28fff4', '#17c800', '#ff00a1', '#fcd34d', '#fca5a5'],
};

// Light theme colors
export const LIGHT_COLORS = {
    accent: '#8cdd00',
    cardBg: '#FFFFFF',
    red: '#ff0000',
    white: '#FFFFFF',
    background_White: '#333333',
    chart: "#dddddd",
    black: '#000000',
    gray: '#808080',
    background: '#f1f1f1',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5E5',
    chartColors: ['#375fff', '#28fff4', '#17c800', '#ff00a1', '#fcd34d', '#fca5a5'],
};

// Default to dark theme for backward compatibility
export const COLORS = DARK_COLORS;

// Font weights
export const FONTS = {
    bold: 700,
    semibold: 600,
    normal: 400,
};

// Font sizes
export const SIZES = {
    xs: moderateScale(12),
    sm: moderateScale(14),
    base: moderateScale(16),
    xl: moderateScale(20),
    '2xl': moderateScale(24),
};

// Card shadow
export const CARD_SHADOW = {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
};

