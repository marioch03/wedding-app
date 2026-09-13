import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePageTitle } from '../usePageTitle';

describe('Hook: usePageTitle', () => {
  beforeEach(() => {
    document.title = 'Nuestra Boda';
  });

  it('actualiza el título del documento con el texto proporcionado', () => {
    renderHook(() => usePageTitle('Elena & Carlos | Nuestra Boda'));
    expect(document.title).toBe('Elena & Carlos | Nuestra Boda');
  });

  it('restaura el título previo al desmontar el componente', () => {
    document.title = 'Título Original';
    const { unmount } = renderHook(() => usePageTitle('Nueva Página | Nuestra Boda'));
    expect(document.title).toBe('Nueva Página | Nuestra Boda');

    unmount();
    expect(document.title).toBe('Título Original');
  });

  it('actualiza el título cuando cambia el parámetro', () => {
    let title = 'Página Inicial | Nuestra Boda';
    const { rerender } = renderHook(({ t }) => usePageTitle(t), {
      initialProps: { t: title },
    });
    expect(document.title).toBe('Página Inicial | Nuestra Boda');

    title = 'Página Actualizada | Nuestra Boda';
    rerender({ t: title });
    expect(document.title).toBe('Página Actualizada | Nuestra Boda');
  });
});
