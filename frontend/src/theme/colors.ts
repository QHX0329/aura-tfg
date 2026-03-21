/**
 * Paleta de colores de BargAIn — "Editorial Mediterranean"
 *
 * Base marfil cálida con primario oliva y secundarios tierra para una
 * estética premium sin perder legibilidad y contraste.
 */

export const colors = {
  // ─── Identidad de marca ───────────────────────────────────────────────
  /** Verde oliva editorial — CTA principal */
  primary: "#3E5219",
  /** Terracota profunda — acentos cálidos */
  secondary: "#904D00",
  /** Ámbar cálido — highlights y foco visual */
  accent: "#FFA049",

  // ─── Fondos y superficies ────────────────────────────────────────────
  /** Lienzo marfil */
  background: "#FCF9F8",
  /** Superficie base */
  surface: "#FFFFFF",
  /** Superficie secundaria */
  surfaceVariant: "#F6F3F2",

  // ─── Texto ───────────────────────────────────────────────────────────
  /** Carbón cálido — texto principal */
  text: "#1B1C1C",
  /** Gris oliva apagado — texto secundario */
  textMuted: "#45483C",
  /** Texto desactivado */
  textDisabled: "#9AA08F",

  // ─── Estados semánticos ──────────────────────────────────────────────
  /** Verde de confirmación */
  success: "#3E6A2A",
  /** Rojo Alerta — errores, precio subido, avisos críticos */
  error: "#C0392B",
  /** Ámbar aviso */
  warning: "#A16A19",
  /** Azul informativo */
  info: "#2F6577",

  // ─── Bordes y separadores ────────────────────────────────────────────
  /** Borde suave */
  border: "#D9DCD1",
  /** Divisor ligero */
  divider: "#EAECE3",

  // ─── Tintes de primaria (estados interactivos) ───────────────────────
  primaryTint: "#EDF3E1",
  primaryLight: "#556B2F",
  primaryDark: "#2D3D10",

  // ─── Tintes de secundaria ────────────────────────────────────────────
  secondaryTint: "#FFF1E3",
  secondaryLight: "#B06D26",
  secondaryDark: "#6E3A00",

  // ─── Tintes de acento ────────────────────────────────────────────────
  accentTint: "#FFF7EF",
  accentDark: "#A9601C",

  // ─── Fondos semánticos con opacidad ──────────────────────────────────
  successBg: "#EEF5E9",
  errorBg: "#FCEAE9",
  warningBg: "#FFF5E8",
  infoBg: "#EAF4F8",

  // ─── Overlays ────────────────────────────────────────────────────────
  overlay: "rgba(27, 28, 28, 0.46)",
  overlayLight: "rgba(27, 28, 28, 0.14)",
  overlayHeavy: "rgba(27, 28, 28, 0.68)",

  // ─── Primitivos ──────────────────────────────────────────────────────
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // ─── Colores de cadenas de supermercado ──────────────────────────────
  /** Usado en chips de tienda, marcadores de mapa y logos */
  chains: {
    mercadona: "#00A650",
    lidl: "#0050AA",
    aldi: "#00529F",
    carrefour: "#004A99",
    dia: "#E30613",
    alcampo: "#E4002B",
    local: "#904D00",
  },

  // ─── Compat legacy (v1 theme API) ─────────────────────────────────────
  // Mantiene operativas pantallas que todavía consumen `colors.light.*`.
  light: {
    background: "#FCF9F8",
    surface: "#FFFFFF",
    surfaceVariant: "#F6F3F2",
    text: "#1B1C1C",
    textSecondary: "#45483C",
    textTertiary: "#9AA08F",
    border: "#D9DCD1",
    divider: "#EAECE3",
    tabBar: "#FFFFFF",
    tabBarInactive: "#75796B",
  },
} as const;

export type Colors = typeof colors;
