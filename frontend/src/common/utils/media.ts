const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Normaliza una URL de medio (portada, historia, galería).
 * Si es una URL externa (http/https) o data/blob URI, la devuelve tal cual.
 * Si es una ruta relativa (/media/...), antepone el host del backend.
 */
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return '';

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  if (path.startsWith('/media/')) {
    return `${API_BASE_URL}${path}`;
  }

  return path;
};
