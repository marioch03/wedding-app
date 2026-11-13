import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CLARIFICATION_TITLE } from '../../../../../types';
import { ClarificationSection } from '../ClarificationSection';

describe('Feature: ClarificationSection (Web Pública - Aclaración para Invitados)', () => {
  it('no renderiza nada si no hay texto aclarativo o está vacío', () => {
    const { container: emptyContainer } = render(<ClarificationSection />);
    expect(emptyContainer.firstChild).toBeNull();

    const { container: blankContainer } = render(
      <ClarificationSection text="   " />
    );
    expect(blankContainer.firstChild).toBeNull();
  });

  it('renderiza el título por defecto «Una pequeña aclaración sobre nuestra celebración 🤍» cuando no se pasa título personalizado', () => {
    render(
      <ClarificationSection text="Queremos celebrar una boda íntima solo para adultos." />
    );

    expect(
      screen.getByRole('heading', { name: DEFAULT_CLARIFICATION_TITLE })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Queremos celebrar una boda íntima solo para adultos.')
    ).toBeInTheDocument();
  });

  it('renderiza un título personalizado cuando se proporciona junto con el texto aclarativo', () => {
    render(
      <ClarificationSection
        title="Una pequeña aclaración sobre nuestra celebración 🤍"
        text="Por motivos de aforo, la celebración será exclusivamente para adultos."
      />
    );

    expect(
      screen.getByRole('heading', {
        name: 'Una pequeña aclaración sobre nuestra celebración 🤍',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Por motivos de aforo, la celebración será exclusivamente para adultos.'
      )
    ).toBeInTheDocument();
  });
});
