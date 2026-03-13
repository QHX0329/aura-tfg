/**
 * Sistema tipográfico de BargAIn — "Mercado Mediterráneo Digital"
 *
 * Tres familias tipográficas con roles muy definidos:
 *
 * • DM Serif Display  — Headings y display text. Personalidad mediterránea,
 *                       carácter serifa cálido que evoca carteles de mercado.
 *
 * • Plus Jakarta Sans — Body, UI labels, navegación. Sans-serif moderno y
 *                       legible a cualquier tamaño en pantalla móvil.
 *
 * • Fira Code         — Exclusivo para cantidades monetarias (€). Monoespaciado
 *                       que da peso visual y precisión a los precios.
 *
 * Instalación (expo-google-fonts):
 *   npx expo install @expo-google-fonts/dm-serif-display
 *   npx expo install @expo-google-fonts/plus-jakarta-sans
 *   npx expo install @expo-google-fonts/fira-code
 *
 * En _layout.tsx o App.tsx:
 *   const [fontsLoaded] = useFonts({
 *     'DMSerifDisplay-Regular': DMSerifDisplay_400Regular,
 *     'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
 *     'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
 *     'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
 *     'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
 *     'FiraCode-Regular': FiraCode_400Regular,
 *     'FiraCode-Medium': FiraCode_500Medium,
 *   });
 */

// ─── Nombres de familia ───────────────────────────────────────────────────────

export const fontFamilies = {
  /** DM Serif Display Regular — headings, hero text, display */
  display: 'DMSerifDisplay-Regular',
  /** Plus Jakarta Sans — todos los textos de interfaz */
  body: 'PlusJakartaSans-Regular',
  bodyMedium: 'PlusJakartaSans-Medium',
  bodySemiBold: 'PlusJakartaSans-SemiBold',
  bodyBold: 'PlusJakartaSans-Bold',
  /** Fira Code — cantidades monetarias únicamente */
  mono: 'FiraCode-Regular',
  monoMedium: 'FiraCode-Medium',
} as const;

// ─── Escala de tamaños (8pt grid, mínimo 11px) ───────────────────────────────

export const fontSize = {
  /** 11px — caption, badges, etiquetas muy pequeñas */
  xs: 11,
  /** 13px — labels de formulario, metadata, tiempo */
  sm: 13,
  /** 15px — texto de cuerpo estándar */
  md: 15,
  /** 17px — texto de cuerpo grande, subtítulos */
  lg: 17,
  /** 20px — subtítulos de sección */
  xl: 20,
  /** 24px — títulos de pantalla */
  '2xl': 24,
  /** 30px — títulos grandes */
  '3xl': 30,
  /** 38px — display, número de ahorro destacado */
  '4xl': 38,
  /** 48px — hero display (onboarding, cifras clave) */
  '5xl': 48,
} as const;

// ─── Pesos ────────────────────────────────────────────────────────────────────

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// ─── Alturas de línea ─────────────────────────────────────────────────────────

export const lineHeight = {
  /** 1.15 — display grandes, un solo renglón */
  tight: 1.15,
  /** 1.35 — headings H2-H3 */
  snug: 1.35,
  /** 1.5 — cuerpo de texto estándar */
  normal: 1.5,
  /** 1.7 — texto largo, párrafos de chat */
  relaxed: 1.7,
} as const;

// ─── Tracking (letter-spacing) ───────────────────────────────────────────────

export const letterSpacing = {
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  /** Para labels en mayúsculas */
  wider: 0.8,
  /** Para caps tracking decorativo */
  widest: 1.5,
} as const;

// ─── Estilos compuestos listos para usar ─────────────────────────────────────

/**
 * Estilos tipográficos predefinidos. Usar como spread o TextStyle directamente.
 *
 * @example
 * <Text style={[textStyles.heading1, { color: colors.text }]}>
 *   BargAIn
 * </Text>
 */
export const textStyles = {
  // Display — DM Serif, pantalla completa / hero
  heroDisplay: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['5xl'],
    lineHeight: Math.round(fontSize['5xl'] * lineHeight.tight),
    letterSpacing: letterSpacing.tight,
  },
  displayLarge: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['4xl'],
    lineHeight: Math.round(fontSize['4xl'] * lineHeight.tight),
    letterSpacing: letterSpacing.tight,
  },

  // Headings — DM Serif
  heading1: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['3xl'],
    lineHeight: Math.round(fontSize['3xl'] * lineHeight.snug),
    letterSpacing: letterSpacing.tight,
  },
  heading2: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['2xl'],
    lineHeight: Math.round(fontSize['2xl'] * lineHeight.snug),
    letterSpacing: letterSpacing.tight,
  },
  // Sub-headings — Plus Jakarta Sans (sans da más densidad de info)
  heading3: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSize.xl,
    lineHeight: Math.round(fontSize.xl * lineHeight.snug),
    letterSpacing: letterSpacing.normal,
  },
  heading4: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSize.lg,
    lineHeight: Math.round(fontSize.lg * lineHeight.snug),
    letterSpacing: letterSpacing.normal,
  },

  // Body — Plus Jakarta Sans
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.lg,
    lineHeight: Math.round(fontSize.lg * lineHeight.normal),
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.md,
    lineHeight: Math.round(fontSize.md * lineHeight.normal),
  },
  bodyMedium: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSize.md,
    lineHeight: Math.round(fontSize.md * lineHeight.normal),
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * lineHeight.normal),
  },

  // Label — Plus Jakarta Sans SemiBold con tracking
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * lineHeight.snug),
    letterSpacing: letterSpacing.wide,
  },
  labelSmall: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSize.xs,
    lineHeight: Math.round(fontSize.xs * lineHeight.snug),
    letterSpacing: letterSpacing.wider,
  },

  // Caption — muy pequeño, metadatos
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.xs,
    lineHeight: Math.round(fontSize.xs * lineHeight.normal),
  },

  // Button — CTA, acciones principales
  button: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSize.md,
    lineHeight: Math.round(fontSize.md * lineHeight.snug),
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * lineHeight.snug),
    letterSpacing: letterSpacing.wide,
  },

  // Precio — Fira Code, exclusivo para cantidades monetarias
  priceLarge: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: fontSize['3xl'],
    lineHeight: Math.round(fontSize['3xl'] * lineHeight.tight),
    letterSpacing: letterSpacing.tight,
  },
  price: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: fontSize.xl,
    lineHeight: Math.round(fontSize.xl * lineHeight.snug),
  },
  priceSmall: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSize.md,
    lineHeight: Math.round(fontSize.md * lineHeight.snug),
  },
  priceCaption: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * lineHeight.snug),
  },
} as const;

// ─── Objeto unificado para importación conveniente ────────────────────────────

export const typography = {
  fontFamilies,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
} as const;

export type Typography = typeof typography;
