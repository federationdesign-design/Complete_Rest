import Image from 'next/image';
import type { SiteImage } from '../../lib/content';
import styles from './Gallery.module.css';

// Every image cropped to the same aspect ratio, same gutter throughout:
// two across on phones, three from tablet up.
export default function Gallery({ images, label }: { images: SiteImage[]; label: string }) {
  if (images.length === 0) return null;
  return (
    <ul className={styles.gallery} aria-label={label}>
      {images.map((image) => (
        <li key={image.src} className={styles.item}>
          <Image
            className={styles.image}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 64em) 17vw, (min-width: 48em) 33vw, 50vw"
            style={image.focal ? { objectPosition: image.focal } : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
