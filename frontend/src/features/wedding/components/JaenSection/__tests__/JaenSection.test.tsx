import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_JAEN_TITLE, type BarItem } from '../../../../../types';
import { JaenSection } from '../JaenSection';

describe('Feature: JaenSection (Web Pública - Y en Jaén....¿qué?)', () => {
  it('no renderiza nada si no hay texto ni bares recomendados', () => {
    const { container } = render(<JaenSection />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el título predeterminado «Y en Jaén....¿qué? 🌿 🫒» y el texto sobre Jaén', () => {
    render(
      <JaenSection text="Jaén es conocida por su catedral renacentista y su tradición de tapas." />
    );

    expect(
      screen.getByRole('heading', { name: DEFAULT_JAEN_TITLE })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Jaén es conocida por su catedral renacentista y su tradición de tapas.'
      )
    ).toBeInTheDocument();
  });

  it('renderiza la lista de bares recomendados con su nombre, ubicación, descripción y enlace a Google Maps', () => {
    const bars: BarItem[] = [
      {
        id: 'bar-1',
        name: 'Taberna El Gorrión',
        address: 'Calle Arco del Consuelo 7, Jaén',
        description: 'La taberna más antigua de Jaén, ideal para el tapeo tradicional.',
        websiteUrl: 'https://tabernaelgorrion.es',
      },
    ];

    render(
      <JaenSection
        text="Disfruta del mejor tapeo por las tascas del centro histórico."
        bars={bars}
      />
    );

    expect(
      screen.getByRole('heading', { name: DEFAULT_JAEN_TITLE })
    ).toBeInTheDocument();
    expect(screen.getByText('Taberna El Gorrión')).toBeInTheDocument();
    expect(
      screen.getByText('Calle Arco del Consuelo 7, Jaén')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'La taberna más antigua de Jaén, ideal para el tapeo tradicional.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Cómo llegar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Ver sitio web o carta de Taberna El Gorrión/i })
    ).toHaveAttribute('href', 'https://tabernaelgorrion.es');
  });
});

