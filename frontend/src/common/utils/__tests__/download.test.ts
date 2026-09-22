import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile } from '../download';

describe('downloadFile utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('descarga el archivo correctamente usando fetch y blob', async () => {
    const mockBlob = new Blob(['fake image content'], { type: 'image/jpeg' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      })
    );

    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/test');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const result = await downloadFile('http://localhost:8080/media/test.jpg', 'mi-foto.jpg');

    expect(result).toBe(true);
    expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('utiliza fallback cuando fetch falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    );

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const result = await downloadFile('http://localhost:8080/media/test.jpg', 'mi-foto.jpg');

    expect(result).toBe(false);
    expect(clickSpy).toHaveBeenCalled();
  });
});
