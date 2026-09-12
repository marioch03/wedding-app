import React from 'react';
import styles from './WeddingSkeleton.module.css';

export const WeddingSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={`${styles.shimmer} ${styles.heroTag}`} />
      <div className={`${styles.shimmer} ${styles.heroTitle}`} />
      <div className={`${styles.shimmer} ${styles.heroDate}`} />
      <div className={styles.countdownGrid}>
        <div className={`${styles.shimmer} ${styles.countdownBox}`} />
        <div className={`${styles.shimmer} ${styles.countdownBox}`} />
        <div className={`${styles.shimmer} ${styles.countdownBox}`} />
        <div className={`${styles.shimmer} ${styles.countdownBox}`} />
      </div>
      <div className={`${styles.shimmer} ${styles.contentCard}`} />
      <div className={`${styles.shimmer} ${styles.contentCard}`} />
    </div>
  );
};
