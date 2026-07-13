// 1. Imports — External
import type { HTMLAttributes, ReactNode } from "react";

// 1. Imports — Local constants
import { COLORS, SPACING, SHADOWS } from "../../../constants/theme";

// 2. Interfaces
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// 3. Component
/**
 * The standard JalanGuard surface card.
 *
 * Single source of truth for the card shell used by KeyPage, ProfileSection
 * and AuthPage — previously each page duplicated this exact style object.
 * Extra div props (onKeyDown, aria-*) pass straight through; `style` merges
 * over the base for per-page tweaks (width, padding…).
 */
export function Card({ children, style, ...rest }: Readonly<CardProps>) {
  return (
    <div style={{ ...styles.card, ...style }} {...rest}>
      {children}
    </div>
  );
}

// 4. Styles
const styles = {
  card: {
    background:   COLORS.surface,
    borderRadius: 24,
    padding:      SPACING.xl,
    border:       `1px solid ${COLORS.borderFaint}`,
    boxShadow:    SHADOWS.card,
  },
} as const;
