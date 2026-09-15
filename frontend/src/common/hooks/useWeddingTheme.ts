import { useEffect } from 'react';
import { applyCustomTheme } from '../utils/theme';

/**
 * Hook para sincronizar el tema visual dinámico con los colores de la boda.
 */
export function useWeddingTheme(primaryColor?: string | null, accentColor?: string | null): void {
  useEffect(() => {
    applyCustomTheme(primaryColor, accentColor);
  }, [primaryColor, accentColor]);
}
