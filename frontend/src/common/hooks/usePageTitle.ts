import { useEffect } from 'react';

/**
 * Hook personalizado para actualizar el título de la pestaña del navegador
 * en cada sección o vista de la aplicación.
 *
 * @param title Texto del título para la pestaña del navegador
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) {
      document.title = title;
    }
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
