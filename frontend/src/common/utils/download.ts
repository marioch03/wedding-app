/**
 * Utilidad para descargar imágenes y ficheros en el navegador (móviles y escritorio).
 * Utiliza fetch + Blob URL para asegurar que el navegador descargue el archivo
 * en lugar de solo abrirlo en una pestaña nueva cuando sea posible.
 */
export const downloadFile = async (url: string, suggestedFilename: string): Promise<boolean> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = suggestedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
    return true;
  } catch {
    // Fallback estándar en caso de fallo de fetch
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedFilename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return false;
  }
};
