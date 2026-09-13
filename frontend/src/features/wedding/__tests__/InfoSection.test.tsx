import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PracticalDetailSection } from "../../../types/wedding";
import { InfoSection } from "../components/InfoSection/InfoSection";

describe("Feature: InfoSection (Web Pública - Detalles para Invitados)", () => {
  it("no renderiza nada si no hay tarjetas estándar, ni secciones personalizadas, ni FAQs", () => {
    const { container } = render(<InfoSection />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza tarjetas estándar cuando están configuradas", () => {
    render(
      <InfoSection
        dressCode="Formal / Traje oscuro"
        accommodations="Hotel Gran Vía"
        transportInfo="Autobuses desde Plaza Mayor"
      />,
    );

    expect(screen.getByText("Detalles para Invitados")).toBeInTheDocument();
    expect(screen.getByText("Código de Vestimenta")).toBeInTheDocument();
    expect(screen.getByText("Formal / Traje oscuro")).toBeInTheDocument();

    expect(screen.getByText("Alojamiento Recomendado")).toBeInTheDocument();
    expect(screen.getByText("Hotel Gran Vía")).toBeInTheDocument();

    expect(screen.getByText("Cómo Llegar / Transporte")).toBeInTheDocument();
    expect(screen.getByText("Autobuses desde Plaza Mayor")).toBeInTheDocument();
  });

  it("renderiza secciones personalizadas añadidas por los novios", () => {
    const customSections: PracticalDetailSection[] = [
      {
        id: "sec-1",
        icon: "🎁",
        title: "Lista de Bodas & Regalos",
        description:
          "Vuestra presencia es nuestro mejor regalo. Si queréis tener un detalle: ES12 3456...",
      },
      {
        id: "sec-2",
        icon: "👶",
        title: "Niños en la Celebración",
        description:
          "Habrá servicio de animación infantil durante el banquete y fiesta.",
      },
    ];

    render(
      <InfoSection dressCode="Elegante" customSections={customSections} />,
    );

    expect(screen.getByText("Código de Vestimenta")).toBeInTheDocument();
    expect(screen.getByText("Lista de Bodas & Regalos")).toBeInTheDocument();
    expect(
      screen.getByText(/Vuestra presencia es nuestro mejor regalo/i),
    ).toBeInTheDocument();
    expect(screen.getByText("🎁")).toBeInTheDocument();

    expect(screen.getByText("Niños en la Celebración")).toBeInTheDocument();
    expect(
      screen.getByText(/Habrá servicio de animación infantil/i),
    ).toBeInTheDocument();
    expect(screen.getByText("👶")).toBeInTheDocument();
  });

  it("renderiza preguntas frecuentes (faqs) correctamente", () => {
    render(
      <InfoSection
        faqs={[
          {
            question: "¿Hay aparcamiento?",
            answer: "Sí, gratuito en el recinto.",
          },
        ]}
      />,
    );

    expect(screen.getByText("Preguntas Frecuentes")).toBeInTheDocument();
    expect(screen.getByText("¿Hay aparcamiento?")).toBeInTheDocument();
    expect(screen.getByText("Sí, gratuito en el recinto.")).toBeInTheDocument();
  });
});
