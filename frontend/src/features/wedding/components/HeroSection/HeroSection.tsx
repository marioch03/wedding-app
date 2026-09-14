import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  heroSubtitle?: string;
  coverImageUrl?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85';

export const HeroSection: React.FC<HeroSectionProps> = ({
  partner1Name,
  partner2Name,
  weddingDate,
  heroSubtitle,
  coverImageUrl,
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    const targetDate = new Date(`${weddingDate}T00:00:00`).getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  const formattedDate = new Date(`${weddingDate}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bgImage = getMediaUrl(coverImageUrl) || DEFAULT_COVER_IMAGE;

  return (
    <section className={styles.heroContainer}>

      {/* Capa 1: Imagen con Ken Burns */}
      <div
        className={styles.heroBackground}
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Capa 2: Overlay gradiente cinematográfico */}
      <div className={styles.heroOverlay} />

      {/* Capa 3: Viñeta radial para profundidad */}
      <div className={styles.heroVignette} />

      {/* Capa 4: Orbes bokeh flotantes */}
      <div className={styles.bokehLayer} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orb1}`} />
        <span className={`${styles.orb} ${styles.orb2}`} />
        <span className={`${styles.orb} ${styles.orb3}`} />
      </div>

      {/* Contenido principal */}
      <div className={styles.heroContent}>

        {/* Ornamento superior */}
        <div className={styles.ornament} aria-hidden="true">
          <span className={styles.ornamentLine} />
          <span className={styles.ornamentIcon}>✦ ✦ ✦</span>
          <span className={styles.ornamentLine} />
        </div>

        <span className={styles.badge}>{heroSubtitle || '¡Nos Casamos!'}</span>

        {/* Nombres en layout editorial apilado */}
        <h1 className={styles.names}>
          <span>{partner1Name}</span>
          <span className={styles.separator}>— &amp; —</span>
          <span>{partner2Name}</span>
        </h1>

        <p className={styles.date}>{formattedDate}</p>

        {/* Divisor decorativo */}
        <div className={styles.dateDivider} aria-hidden="true">
          <span className={styles.dateDividerIcon}>✦</span>
        </div>

        {/* Countdown */}
        <div className={styles.countdownContainer}>
          <div className={styles.countdownBox}>
            <span className={styles.countdownNumber}>{timeLeft.days}</span>
            <span className={styles.countdownLabel}>Días</span>
          </div>
          <div className={styles.countdownBox}>
            <span className={styles.countdownNumber}>{timeLeft.hours}</span>
            <span className={styles.countdownLabel}>Horas</span>
          </div>
          <div className={styles.countdownBox}>
            <span className={styles.countdownNumber}>{timeLeft.minutes}</span>
            <span className={styles.countdownLabel}>Min</span>
          </div>
          <div className={styles.countdownBox}>
            <span className={styles.countdownNumber}>{timeLeft.seconds}</span>
            <span className={styles.countdownLabel}>Seg</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/rsvp" className={styles.primaryButton}>
            Confirmar Asistencia
          </Link>
        </div>
      </div>

      {/* Indicador de scroll animado */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollLine} />
        <span className={styles.scrollDot} />
      </div>

      {/* Ola de transición doble hacia la siguiente sección */}
      <div className={styles.sectionWave} aria-hidden="true">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" aria-hidden="true">
          <path
            className={styles.wavePath1}
            d="M0,42 C360,78 720,8 1080,48 C1260,66 1380,36 1440,42 L1440,72 L0,72 Z"
          />
          <path
            className={styles.wavePath2}
            d="M0,58 C280,20 600,72 960,46 C1180,26 1340,64 1440,46 L1440,72 L0,72 Z"
          />
        </svg>
      </div>
    </section>
  );
};
