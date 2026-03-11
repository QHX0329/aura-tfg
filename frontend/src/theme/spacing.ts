/**
 * Sistema de espaciado de BargAIn.
 *
 * Basado en un grid de 4px para consistencia visual.
 */

export const spacing = {
  /** 0px */
  none: 0,
  /** 2px */
  '2xs': 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  '2xl': 24,
  /** 32px */
  '3xl': 32,
  /** 40px */
  '4xl': 40,
  /** 48px */
  '5xl': 48,
  /** 64px */
  '6xl': 64,
} as const;

/** Radios de borde */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/** Sombras */
export const shadows = {
  sm: {
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  md: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  lg: {
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  },
} as const;
