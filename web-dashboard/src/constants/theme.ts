/**
 * Theme Configuration for JalanGuard Web Dashboard
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
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    xxl: '3rem',    // 48px
} as const;

export const FONT_SIZES = {
    xs: '0.625rem',  // 10px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.25rem',   // 20px
    xl: '1.5rem',    // 24px
    xxl: '2rem',     // 32px
} as const;

export const BORDER_RADIUS = {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
} as const;

export const SHADOWS = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

export type ColorType = keyof typeof COLORS;
export type SpacingType = keyof typeof SPACING;
export type FontSizeType = keyof typeof FONT_SIZES;
