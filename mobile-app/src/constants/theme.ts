/**
 * Theme Configuration for JalanGuard Mobile App
 * Midnight Infrastructure Palette - Single Source of Truth
 */

export const COLORS = {
    // Brand Colors
    primary: '#0F172A',      // Deep Midnight (Authority, Text, Headers)
    secondary: '#D97706',    // Burnt Amber (Action Buttons, Alerts)
    accent: '#334155',       // Steel Blue (Secondary actions, Borders)
    background: '#F8FAFC',   // Ghost White (App Background)
    surface: '#E2E8F0',      // Slate White (Cards, Inputs)

    // Utility & Status Colors
    success: '#10B981',      // Emerald Green (Fixed, Success)
    error: '#EF4444',        // Bright Red (Critical Defect, Error)
    warning: '#F59E0B',      // Amber (Pending Review)
    info: '#3B82F6',         // Bright Blue (General info/Stats)

    // Base
    white: '#FFFFFF',
    black: '#000000',
    disabled: '#94A3B8',
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
} as const;

export const FONT_SIZES = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
} as const;

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
} as const;

export const SHADOWS = {
    sm: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
} as const;

export type ColorType = keyof typeof COLORS;
export type SpacingType = keyof typeof SPACING;
export type FontSizeType = keyof typeof FONT_SIZES;
