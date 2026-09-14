import React, { useEffect, useState } from 'react';
import { weddingApi } from '../../../lib/api';
import type { WeddingPublicResponse } from '../../../types';
import { HeroSection } from '../components/HeroSection/HeroSection';
import { StorySection } from '../components/StorySection/StorySection';
import { TimelineSection } from '../../events';
import { GallerySection } from '../components/GallerySection/GallerySection';
import { AccommodationsSection } from '../components/AccommodationsSection/AccommodationsSection';
import { InfoSection } from '../components/InfoSection/InfoSection';
import { FooterSection } from '../components/FooterSection/FooterSection';
import { WeddingSkeleton } from '../components/WeddingSkeleton/WeddingSkeleton';
import { usePageTitle } from '../../../common/hooks';
import styles from './WeddingLandingPage.module.css';

export const WeddingLandingPage: React.FC = () => {
  const [wedding, setWedding] = useState<WeddingPublicResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pageTitle = wedding?.partner1Name && wedding?.partner2Name
    ? `${wedding.partner1Name} & ${wedding.partner2Name} | Nuestra Boda`
    : 'Nuestra Boda | Bienvenidos';
  usePageTitle(pageTitle);

  const loadWeddingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weddingApi.getPublic();
      setWedding(data);
    } catch (err) {
      console.error('Error al cargar datos públicos de la boda:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la información de la boda. Por favor intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeddingData();
  }, []);

  if (isLoading) {
    return <WeddingSkeleton />;
  }

  if (error || !wedding) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Información no disponible</h2>
          <p className={styles.errorMessage}>
            {error || 'No se encontró la configuración activa de la boda.'}
          </p>
          <button onClick={loadWeddingData} className={styles.retryButton} type="button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        <HeroSection
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={wedding.weddingDate}
          heroSubtitle={wedding.content?.heroSubtitle}
          coverImageUrl={wedding.content?.coverImageUrl}
        />

        <StorySection
          storyTitle={wedding.content?.storyTitle}
          storyText={wedding.content?.storyText}
          storyImageUrl={wedding.content?.storyImageUrl}
        />

        <TimelineSection />

        <GallerySection
          galleryImages={wedding.content?.galleryImages}
        />

        <AccommodationsSection
          hotels={wedding.content?.hotels}
        />

        <InfoSection
          customSections={wedding.content?.customSections}
          faqs={wedding.content?.faqs}
        />
      </main>

      <FooterSection
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
      />
    </div>
  );
};
