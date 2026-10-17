import { DEFAULT_SECTION_ORDER, type SectionId } from '../../../types';

/**
 * Normaliza y resuelve el orden de las secciones de la web pública.
 * - Si no hay orden guardado, devuelve el orden por defecto.
 * - Conserva el orden de los IDs válidos definidos por el usuario.
 * - Elimina duplicados e identificadores desconocidos o no válidos.
 * - Añade al final cualquier sección nueva o faltante de DEFAULT_SECTION_ORDER.
 */
export function resolveSectionOrder(storedOrder?: unknown): SectionId[] {
  if (!Array.isArray(storedOrder)) {
    return [...DEFAULT_SECTION_ORDER];
  }

  const validSet = new Set<SectionId>(DEFAULT_SECTION_ORDER);
  const seen = new Set<SectionId>();
  const resolved: SectionId[] = [];

  for (const item of storedOrder) {
    if (typeof item === 'string' && validSet.has(item as SectionId) && !seen.has(item as SectionId)) {
      seen.add(item as SectionId);
      resolved.push(item as SectionId);
    }
  }

  // Añadir cualquier sección faltante de la configuración por defecto
  for (const defaultId of DEFAULT_SECTION_ORDER) {
    if (!seen.has(defaultId)) {
      resolved.push(defaultId);
    }
  }

  return resolved;
}
