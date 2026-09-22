import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccommodationsSection } from '../AccommodationsSection';
import type { HotelItem } from '../../../../../types';

describe('Feature: Hoteles y Alojamiento Recomendado (AccommodationsSection)', () => {
  const sampleHotels: HotelItem[] = [
    {
      id: 'hotel-1',
      name: 'Parador de Alcalá de Henares',
      accommodationType: 'PARADOR',
      description: 'Hermoso convento restaurado con spa.',
      address: 'Calle Colegios 8, 28801 Alcalá de Henares',
      distance: 'A 5 min de la finca',
      priceRange: '120€ / noche',
      phone: '+34 918 880 330',
      websiteUrl: 'https://www.parador.es',
    },
    {
      id: 'hotel-2',
      name: 'Casa Rural El Encinar',
      accommodationType: 'RURAL',
      description: 'Tranquilidad en plena naturaleza.',
      address: 'Camino de las Encinas s/n',
      distance: 'A 10 min de la finca',
    },
  ];

  it('no renderiza nada cuando la lista de hoteles es nula o vacía', () => {
    const { container: emptyContainer } = render(<AccommodationsSection hotels={[]} />);
    expect(emptyContainer.firstChild).toBeNull();

    const { container: nullContainer } = render(<AccommodationsSection hotels={undefined} />);
    expect(nullContainer.firstChild).toBeNull();
  });

  it('renderiza correctamente las tarjetas de alojamiento con su información básica', () => {
    render(<AccommodationsSection hotels={sampleHotels} />);

    expect(screen.getByText('Dónde Alojarse')).toBeInTheDocument();
    expect(screen.getByText('Hoteles y Alojamientos Recomendados')).toBeInTheDocument();

    // Hotel 1
    expect(screen.getByText('Parador de Alcalá de Henares')).toBeInTheDocument();
    expect(screen.getByText('Hermoso convento restaurado con spa.')).toBeInTheDocument();
    expect(screen.getByText(/Calle Colegios 8/i)).toBeInTheDocument();
    expect(screen.getByText('⏱️ A 5 min de la finca')).toBeInTheDocument();
    expect(screen.getByText('💶 120€ / noche')).toBeInTheDocument();

    // Hotel 2
    expect(screen.getByText('Casa Rural El Encinar')).toBeInTheDocument();
    expect(screen.getByText('Tranquilidad en plena naturaleza.')).toBeInTheDocument();
    expect(screen.getByText('⏱️ A 10 min de la finca')).toBeInTheDocument();
  });

  it('incluye enlace seguro a Google Maps para navegación (Cómo llegar)', () => {
    render(<AccommodationsSection hotels={sampleHotels} />);

    const mapLinks = screen.getAllByRole('link', { name: /Cómo llegar/i });
    expect(mapLinks).toHaveLength(2);

    const firstMapLink = mapLinks[0];
    expect(firstMapLink).toHaveAttribute('target', '_blank');
    expect(firstMapLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(firstMapLink.getAttribute('href')).toContain('google.com/maps/search');
  });

  it('incluye enlace al sitio web oficial y enlace telefónico cuando están disponibles', () => {
    render(<AccommodationsSection hotels={sampleHotels} />);

    // Sitio web del Hotel 1
    const webLink = screen.getByRole('link', { name: /Sitio Web \/ Reservar/i });
    expect(webLink).toHaveAttribute('href', 'https://www.parador.es');
    expect(webLink).toHaveAttribute('target', '_blank');
    expect(webLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Teléfono del Hotel 1
    const phoneLink = screen.getByTitle(/Llamar a Parador de Alcalá de Henares/i);
    expect(phoneLink).toHaveAttribute('href', 'tel:+34918880330');
  });

  it('renderiza mini-mapa embed oficial de Google Maps con fallback automático', () => {
    render(<AccommodationsSection hotels={sampleHotels} />);

    const iframes = screen.getAllByTitle(/Ubicación y ficha de/i);
    expect(iframes).toHaveLength(2);

    const firstIframe = iframes[0];
    expect(firstIframe).toHaveAttribute('loading', 'lazy');
    expect(firstIframe.getAttribute('src')).toContain('output=embed');
    expect(firstIframe.getAttribute('src')).toContain(encodeURIComponent('Parador de Alcalá de Henares, Calle Colegios 8, 28801 Alcalá de Henares'));
  });

  it('soporta código iframe pegado por el administrador y extrae limpiamente la URL', () => {
    const hotelsWithIframe: HotelItem[] = [
      {
        id: 'hotel-custom',
        name: 'Hotel Boutique Romántico',
        googleMapsUrl: '<iframe src="https://www.google.com/maps/embed?pb=custom-marker-123" width="600" height="450"></iframe>',
      },
    ];

    render(<AccommodationsSection hotels={hotelsWithIframe} />);

    const iframe = screen.getByTitle(/Ubicación y ficha de Hotel Boutique Romántico/i);
    expect(iframe).toHaveAttribute('src', 'https://www.google.com/maps/embed?pb=custom-marker-123');
  });

  it('muestra el código de descuento, detalles, instrucciones y permite copiar el código al portapapeles', async () => {
    const hotelsWithDiscount: HotelItem[] = [
      {
        id: 'hotel-discount',
        name: 'Hotel Plaza Mayor',
        discountCode: 'BODA2026',
        discountDetails: '15% de dto.',
        discountInstructions: 'Indicar el código al reservar por teléfono o en su web',
        discountExpiresAt: '31/12/2026',
      },
    ];

    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<AccommodationsSection hotels={hotelsWithDiscount} />);

    expect(screen.getByText('BODA2026')).toBeInTheDocument();
    expect(screen.getByText('15% de dto.')).toBeInTheDocument();
    expect(screen.getByText(/Indicar el código al reservar por teléfono/i)).toBeInTheDocument();
    expect(screen.getByText(/Válido hasta: 31\/12\/2026/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Copiar código de descuento BODA2026/i });
    expect(copyBtn).toHaveTextContent(/Copiar/i);

    copyBtn.click();

    expect(writeTextMock).toHaveBeenCalledWith('BODA2026');
    expect(await screen.findByText('¡Copiado!')).toBeInTheDocument();
  });
});
