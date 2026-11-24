'use client';
import styles from './SocialPreviewFrame.module.css';

export const PREVIEW_SAFE_AREAS = {
  feed: {top: 8, right: 8, bottom: 8, left: 8},
  vertical: {top: 10, right: 16, bottom: 18, left: 8},
};

// Exclusiv DOM/CSS: nu desenează și nu scrie nimic în canvas-ul exportat.
export default function SocialPreviewFrame({format, showGuides, phonePreview, children}) {
  const vertical = format === 'vertical';
  const safe = PREVIEW_SAFE_AREAS[vertical ? 'vertical' : 'feed'];
  return <div className={styles.outer}>
    {phonePreview && <p className={styles.caption}>Vedere compactă · maximum 320 px · nu reproduce exact un dispozitiv</p>}
    <div className={`${styles.frame} ${phonePreview ? styles.phone : ''}`}
      style={{aspectRatio: vertical ? '9 / 16' : '4 / 5'}}>
      {children}
      {showGuides && <div className={styles.guides} aria-hidden="true" data-preview-only="true">
        <div className={styles.safe} style={{top: `${safe.top}%`, right: `${safe.right}%`, bottom: `${safe.bottom}%`, left: `${safe.left}%`}} />
        <span className={styles.topLabel}>{vertical ? 'Interfață sus · orientativ' : 'Margini de precauție · orientativ'}</span>
        {vertical && <span className={styles.rightLabel}>Butoane</span>}
        <span className={styles.bottomLabel}>{vertical ? 'Descriere / controale · orientativ' : 'Verifică decuparea în platformă'}</span>
      </div>}
    </div>
    {showGuides && <p className={styles.caption}>Contur verde: zonă centrală recomandată. Benzile umbrite indică margini de precauție, nu limite oficiale. Verifică versetul, referința și logo-ul în aplicația destinație. Ghidajele nu se exportă.</p>}
  </div>;
}
