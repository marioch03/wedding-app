import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  const bgImage = coverImageUrl || DEFAULT_COVER_IMAGE;

  return (
    <section className={styles.heroContainer}>
      <div
        className={styles.heroBackground}
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <span className={styles.badge}>{heroSubtitle || '¡Nos Casamos!'}</span>

        <h1 className={styles.names}>
          <span>{partner1Name}</span>
          <span className={styles.separator}>&</span>
          <span>{partner2Name}</span>
        </h1>

        <p className={styles.date}>{formattedDate}</p>

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

      {/* Transicion suave hacia la siguiente seccion */}
      <div className={styles.sectionWave} aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </section>
  );
};
