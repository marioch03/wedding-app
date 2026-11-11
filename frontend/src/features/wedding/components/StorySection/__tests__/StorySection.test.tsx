import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StorySection } from '../StorySection';

describe('Feature: Sección de Nuestra Historia (StorySection)', () => {
  it('renderiza título, fecha, ubicación y texto de la historia', () => {
    render(
      <StorySection
        storyTitle="Cómo empezó todo"
        storyDate="18 de Octubre de 2026"
        storyLocation="Madrid, España"
        storyText="Nos conocimos hace diez años en Madrid y desde entonces..."
      />
    );

    expect(screen.getAllByText('Nuestra Historia').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { level: 2, name: 'Cómo empezó todo' })).toBeInTheDocument();
    expect(screen.getByText('18 de Octubre de 2026')).toBeInTheDocument();
    expect(screen.getByText('Madrid, España')).toBeInTheDocument();
    expect(screen.getByText(/Nos conocimos hace diez años en Madrid/i)).toBeInTheDocument();
  });

  it('no renderiza nada si todos los campos están vacíos', () => {
    const { container } = render(<StorySection />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza únicamente los metadatos disponibles cuando solo se configuran algunos campos', () => {
    render(
      <StorySection
        storyTitle="Nuestra Aventura"
        storyLocation="Cala Salada, Ibiza"
      />
    );

    expect(screen.getByText('Nuestra Aventura')).toBeInTheDocument();
    expect(screen.getByText('Cala Salada, Ibiza')).toBeInTheDocument();
    expect(screen.queryByText(/Fecha:/i)).not.toBeInTheDocument();
  });
});
