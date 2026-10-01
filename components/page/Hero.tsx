import Image from 'next/image';
import type { SiteImage } from '../../lib/content';
import HeaderSentinel from '../HeaderSentinel/HeaderSentinel';
import HeroFade from './HeroFade';
import styles from './Hero.module.css';

type Props = { image: SiteImage; heading: string; subheading?: string | null; fadeOnScroll?: boolean };

// Full-height hero on phones (100svh minus the header), shorter band from
// tablet up. The heading sits on a dark gradient for WCAG AA contrast.
export default function Hero({ image, heading, subheading, fadeOnScroll = false }: Props) {
  return (
    <>
      <section className={styles.hero} aria-labelledby="page-heading">
        <Image
          className={styles.image}
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          style={image.focal ? { objectPosition: image.focal } : undefined}
        />
        {fadeOnScroll && <HeroFade />}
        <div className={styles.text}>
          <h1 className={styles.heading} id="page-heading">
            {heading}
          </h1>
          {subheading && <p className={styles.subheading}>{subheading}</p>}
        </div>
      </section>
      <HeaderSentinel />
    </>
  );
}
