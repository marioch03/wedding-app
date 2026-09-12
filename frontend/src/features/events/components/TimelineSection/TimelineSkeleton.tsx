import React from 'react';
import styles from './TimelineSection.module.css';

export const TimelineSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonTimeline} aria-label="Cargando cronograma" role="status">
      {[1, 2, 3].map((item) => (
        <div key={item} className={styles.skeletonItem}>
          <div className={styles.skeletonNode} />
          <div className={styles.skeletonCard}>
            <div className={`${styles.skeletonShimmer} ${styles.skeletonBadge}`} />
            <div className={`${styles.skeletonShimmer} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonShimmer} ${styles.skeletonMeta}`} />
            <div className={`${styles.skeletonShimmer} ${styles.skeletonText}`} />
          </div>
        </div>
      ))}
    </div>
  );
};
