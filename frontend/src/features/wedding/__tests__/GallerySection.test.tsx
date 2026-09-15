import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GallerySection } from '../components/GallerySection/GallerySection';

describe('Feature: GallerySection (Galería de Recuerdos en Web Pública)', () => {
  it('no renderiza nada si no hay fotos o galleryImages está vacío', () => {
    const { container: c1 } = render(<GallerySection />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<GallerySection galleryImages={[]} />);
    expect(c2.firstChild).toBeNull();
  });

  it('no renderiza nada si todas las fotos tienen URLs vacías', () => {
    const { container } = render(
      <GallerySection galleryImages={['', '   ', { url: '', caption: 'Vacío' }]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza la galería cuando hay fotos válidas', () => {
    const images = [
      { url: 'https://ejemplo.com/foto1.jpg', caption: 'Nuestro primer viaje' },
      'https://ejemplo.com/foto2.jpg',
    ];

    render(<GallerySection galleryImages={images} />);

    expect(screen.getByText('Nuestros Recuerdos')).toBeInTheDocument();
    expect(screen.getByText('Nuestro primer viaje')).toBeInTheDocument();
    expect(screen.getByText('Momento especial 2')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('aplica la imagen por defecto fallback si una fotografía da error al cargar', () => {
    const images = [{ url: 'https://ejemplo.com/foto-rota.jpg', caption: 'Foto con error' }];

    render(<GallerySection galleryImages={images} />);

    const img = screen.getByAltText('Foto con error') as HTMLImageElement;
    expect(img.src).toBe('https://ejemplo.com/foto-rota.jpg');

    // Simular error de carga en la imagen
    fireEvent.error(img);

    expect(img.src).toContain('images.unsplash.com');
    expect(img.dataset.fallbackApplied).toBe('true');
  });
});
