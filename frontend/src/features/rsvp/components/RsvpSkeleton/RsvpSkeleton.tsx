import React from 'react';
import styles from './RsvpSkeleton.module.css';

export const RsvpSkeleton: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={`${styles.shimmer} ${styles.headerShimmer}`} />
      <div className={`${styles.shimmer} ${styles.cardShimmer}`} />
      <div className={`${styles.shimmer} ${styles.cardShimmer}`} />
    </div>
  );
};
