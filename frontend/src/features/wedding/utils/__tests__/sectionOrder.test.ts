import { describe, it, expect } from 'vitest';
import { resolveSectionOrder } from '../sectionOrder';
import { DEFAULT_SECTION_ORDER, type SectionId } from '../../../../types';

describe('resolveSectionOrder', () => {
  it('devuelve DEFAULT_SECTION_ORDER si storedOrder es undefined o null', () => {
    expect(resolveSectionOrder(undefined)).toEqual(DEFAULT_SECTION_ORDER);
    expect(resolveSectionOrder(null)).toEqual(DEFAULT_SECTION_ORDER);
  });

  it('devuelve DEFAULT_SECTION_ORDER si storedOrder no es un array', () => {
    expect(resolveSectionOrder('invalid' as unknown)).toEqual(DEFAULT_SECTION_ORDER);
    expect(resolveSectionOrder(123 as unknown)).toEqual(DEFAULT_SECTION_ORDER);
    expect(resolveSectionOrder({} as unknown)).toEqual(DEFAULT_SECTION_ORDER);
  });

  it('respeta el orden personalizado especificado por el usuario', () => {
    const customOrder: SectionId[] = [
      'timeline',
      'accommodations',
      'music',
      'story',
      'gallery',
      'guestPhotos',
      'info',
    ];
    expect(resolveSectionOrder(customOrder)).toEqual(customOrder);
  });

  it('añade al final las secciones faltantes si el array guardado está incompleto', () => {
    const partialOrder: SectionId[] = ['timeline', 'music'];
    const result = resolveSectionOrder(partialOrder);

    expect(result.slice(0, 2)).toEqual(['timeline', 'music']);
    expect(result).toHaveLength(DEFAULT_SECTION_ORDER.length);

    // Todas las secciones por defecto deben estar incluidas
    for (const id of DEFAULT_SECTION_ORDER) {
      expect(result).toContain(id);
    }
  });

  it('ignora identificadores desconocidos y elimina duplicados', () => {
    const dirtyOrder = ['music', 'unknown-section', 'music', 'timeline', 'another-invalid'];
    const result = resolveSectionOrder(dirtyOrder);

    expect(result[0]).toBe('music');
    expect(result[1]).toBe('timeline');
    expect(result).not.toContain('unknown-section');
    expect(result).not.toContain('another-invalid');

    // No debe haber duplicados de music
    expect(result.filter((x) => x === 'music')).toHaveLength(1);
    expect(result).toHaveLength(DEFAULT_SECTION_ORDER.length);
  });
});
