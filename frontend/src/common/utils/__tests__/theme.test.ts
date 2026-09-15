import { describe, it, expect, beforeEach } from 'vitest';
import {
  hexToRgb,
  rgbToHsl,
  hslToHex,
  generatePrimaryPalette,
  generateAccentPalette,
  applyCustomTheme,
  resetCustomTheme,
} from '../theme';

describe('Utilidades de Tema Dinámico (theme.ts)', () => {
  beforeEach(() => {
    resetCustomTheme();
  });

  describe('Conversiones de Color', () => {
    it('convierte HEX a RGB correctamente', () => {
      const rgb = hexToRgb('#DF6A4F');
      expect(rgb).toEqual({ r: 223, g: 106, b: 79 });
    });

    it('maneja HEX corto (#RGB)', () => {
      const rgb = hexToRgb('#FFF');
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('retorna null para HEX inválido', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#12')).toBeNull();
    });

    it('convierte RGB a HSL y de vuelta a HEX', () => {
      const hsl = rgbToHsl(223, 106, 79);
      expect(hsl.h).toBeGreaterThan(0);
      const hex = hslToHex(hsl.h, hsl.s, hsl.l);
      expect(hex.toLowerCase()).toBe('#df6a4f');
    });
  });

  describe('Generación de Paletas', () => {
    it('genera paleta primaria completa con gradiente y sombras', () => {
      const palette = generatePrimaryPalette('#1D4ED8');
      expect(palette).not.toBeNull();
      expect(palette?.primary).toBe('#1D4ED8');
      expect(palette?.primaryDark).toBeDefined();
      expect(palette?.primaryLight).toBeDefined();
      expect(palette?.primaryBorder).toBeDefined();
      expect(palette?.primaryGradient).toContain('linear-gradient(135deg');
      expect(palette?.primaryGlow).toContain('rgba(');
    });

    it('genera paleta de acento', () => {
      const palette = generateAccentPalette('#CBA258');
      expect(palette).not.toBeNull();
      expect(palette?.accent).toBe('#CBA258');
      expect(palette?.accentDark).toBeDefined();
      expect(palette?.accentGradient).toContain('linear-gradient');
    });
  });

  describe('Inyección de Estilos en el DOM (CSS Variables)', () => {
    it('aplica propiedades CSS en document.documentElement al pasar un color válido', () => {
      applyCustomTheme('#1D4ED8', '#CBA258');

      const style = document.documentElement.style;
      expect(style.getPropertyValue('--color-primary')).toBe('#1D4ED8');
      expect(style.getPropertyValue('--color-primary-dark')).toBeDefined();
      expect(style.getPropertyValue('--color-primary-gradient')).toContain('linear-gradient');
      expect(style.getPropertyValue('--color-accent-gold')).toBe('#CBA258');
    });

    it('limpia las propiedades CSS y restablece al pasar null o invocar resetCustomTheme', () => {
      applyCustomTheme('#1D4ED8', '#CBA258');
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#1D4ED8');

      resetCustomTheme();
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('');
      expect(document.documentElement.style.getPropertyValue('--color-accent-gold')).toBe('');
    });
  });
});
