/**
 * Utilidades para el cálculo y aplicación dinámica de temas de color en tiempo de ejecución.
 * Modifica las variables CSS globales (:root) sobre el elemento document.documentElement.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Parsea un color hexadecimal (#RGB o #RRGGBB) a RGB.
 */
export function hexToRgb(hex: string): RGB | null {
  const cleanHex = hex.trim().replace(/^#/, '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

/**
 * Convierte RGB a HSL (h: 0-360, s: 0-100, l: 0-100).
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Convierte HSL a formato HEX.
 */
export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h <= 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Genera una paleta armónica y completa derivada de un color principal.
 */
export function generatePrimaryPalette(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return null;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Oscurecer para estados activos/hover y contrastes fuertes
  const darkL = Math.max(10, hsl.l - 12);
  const primaryDark = hslToHex(hsl.h, Math.min(100, hsl.s + 5), darkL);

  // Aclarar ligeramente para el inicio del gradiente
  const lightGradL = Math.min(95, hsl.l + 4);
  const primaryGradientStart = hslToHex(hsl.h, hsl.s, lightGradL);

  // Tono pastel suave para fondos de badges y etiquetas (luminosidad alta ~92%)
  const primaryLight = hslToHex(hsl.h, Math.max(30, hsl.s - 20), 93);

  // Borde sutil a juego
  const primaryBorder = hslToHex(hsl.h, Math.max(30, hsl.s - 15), 85);

  // Gradiente dinámico 135deg
  const primaryGradient = `linear-gradient(135deg, ${primaryGradientStart} 0%, ${primaryDark} 100%)`;

  // Sombra luminosa con canal alpha
  const primaryGlow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;

  return {
    primary: hexColor.trim(),
    primaryDark,
    primaryLight,
    primaryBorder,
    primaryGradient,
    primaryGlow,
  };
}

/**
 * Genera los tonos de acento (ej. dorados/secundarios) derivados de un color.
 */
export function generateAccentPalette(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return null;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const darkL = Math.max(10, hsl.l - 12);
  const accentDark = hslToHex(hsl.h, Math.min(100, hsl.s + 5), darkL);

  const lightGradL = Math.min(95, hsl.l + 4);
  const accentGradientStart = hslToHex(hsl.h, hsl.s, lightGradL);

  const accentLight = hslToHex(hsl.h, Math.max(25, hsl.s - 20), 95);
  const accentBorder = hslToHex(hsl.h, Math.max(25, hsl.s - 15), 84);
  const accentGradient = `linear-gradient(135deg, ${accentGradientStart} 0%, ${accentDark} 100%)`;

  return {
    accent: hexColor.trim(),
    accentDark,
    accentLight,
    accentBorder,
    accentGradient,
  };
}

/**
 * Aplica un tema de color personalizado inyectando propiedades en :root (document.documentElement.style).
 * Si no se proporciona color o está vacío, elimina las propiedades personalizadas para usar el index.css base.
 */
export function applyCustomTheme(primaryColor?: string | null, accentColor?: string | null): void {
  if (typeof document === 'undefined') return;

  const rootStyle = document.documentElement.style;

  // 1. Color Primario
  if (primaryColor && primaryColor.trim().startsWith('#')) {
    const palette = generatePrimaryPalette(primaryColor);
    if (palette) {
      rootStyle.setProperty('--color-primary', palette.primary);
      rootStyle.setProperty('--color-primary-dark', palette.primaryDark);
      rootStyle.setProperty('--color-primary-light', palette.primaryLight);
      rootStyle.setProperty('--color-primary-border', palette.primaryBorder);
      rootStyle.setProperty('--color-primary-gradient', palette.primaryGradient);
      rootStyle.setProperty('--color-primary-glow', palette.primaryGlow);
    }
  } else {
    // Restablecer variables primarias al CSS por defecto
    rootStyle.removeProperty('--color-primary');
    rootStyle.removeProperty('--color-primary-dark');
    rootStyle.removeProperty('--color-primary-light');
    rootStyle.removeProperty('--color-primary-border');
    rootStyle.removeProperty('--color-primary-gradient');
    rootStyle.removeProperty('--color-primary-glow');
  }

  // 2. Color de Acento (Opcional)
  if (accentColor && accentColor.trim().startsWith('#')) {
    const accentPalette = generateAccentPalette(accentColor);
    if (accentPalette) {
      rootStyle.setProperty('--color-accent-gold', accentPalette.accent);
      rootStyle.setProperty('--color-accent-gold-dark', accentPalette.accentDark);
      rootStyle.setProperty('--color-accent-gold-light', accentPalette.accentLight);
      rootStyle.setProperty('--color-accent-gold-border', accentPalette.accentBorder);
      rootStyle.setProperty('--color-accent-gold-gradient', accentPalette.accentGradient);
    }
  } else {
    rootStyle.removeProperty('--color-accent-gold');
    rootStyle.removeProperty('--color-accent-gold-dark');
    rootStyle.removeProperty('--color-accent-gold-light');
    rootStyle.removeProperty('--color-accent-gold-border');
    rootStyle.removeProperty('--color-accent-gold-gradient');
  }
}

/**
 * Limpia todas las variables de color personalizadas y vuelve al tema base de index.css.
 */
export function resetCustomTheme(): void {
  applyCustomTheme(null, null);
}
