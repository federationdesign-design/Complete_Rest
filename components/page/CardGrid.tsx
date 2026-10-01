import Image from 'next/image';
import Link from 'next/link';
import type { Card } from '../../lib/content';
import Slider from '../Slider/Slider';
import styles from './CardGrid.module.css';

type Props = {
  cards: Card[];
  headingLevel?: 'h2' | 'h3';
  label?: string;
  // wide: four across from desktop, for the four home page tiles.
  wide?: boolean;
  // On phones: a stacked column, or the shared swipe slider.
  mobile?: 'stack' | 'slider';
  // On phones: 'overlay' puts the title over the image on a plain box;
  // 'caption' centres the title over the image with no box below.
  phoneStyle?: 'default' | 'overlay' | 'caption';
};

// One column or a swipe slider on phones, two columns from tablet, three from
// desktop. The title is the link; its hit area covers the whole card. The
// live "more" style label is kept as visible text but hidden from screen
// readers to avoid repeated, ambiguous link names.
export default function CardGrid({
  cards,
  headingLevel = 'h2',
  label,
  wide = false,
  mobile = 'stack',
  phoneStyle = 'default',
}: Props) {
  const Heading = headingLevel;
  const cardClass = [styles.card, phoneStyle === 'overlay' && styles.overlay, phoneStyle === 'caption' && styles.caption]
    .filter(Boolean)
    .join(' ');

  const items = cards.map((card) => (
    <li key={card.href} className={cardClass}>
      {card.image && (
        <div className={styles.media}>
          <Image
            className={styles.image}
            src={card.image.src}
            alt=""
            fill
            sizes={wide ? '(min-width: 64em) 25vw, (min-width: 48em) 50vw, 100vw' : '(min-width: 64em) 33vw, (min-width: 48em) 50vw, 100vw'}
            style={card.image.focal ? { objectPosition: card.image.focal } : undefined}
          />
        </div>
      )}
      <div className={styles.body}>
        <Heading className={styles.title}>
          <Link className={styles.link} href={card.href}>
            {card.title}
          </Link>
        </Heading>
        {card.excerpt && <p className={styles.excerpt}>{card.excerpt}</p>}
        {card.label && (
          <span className={styles.label} aria-hidden="true">
            {card.label}
          </span>
        )}
      </div>
    </li>
  ));

  if (mobile === 'slider') {
    return (
      <Slider className={wide ? `${styles.slides} ${styles.slidesWide}` : styles.slides} label={label}>
        {items}
      </Slider>
    );
  }

  return (
    <ul className={wide ? `${styles.grid} ${styles.wide}` : styles.grid} aria-label={label}>
      {items}
    </ul>
  );
}
