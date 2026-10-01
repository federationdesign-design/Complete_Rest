import Image from 'next/image';
import { members, membersHeading } from '../../lib/members';
import Slider from '../Slider/Slider';
import styles from './Members.module.css';

// Membership logos: a single-row swipe slider on phones (mobile round 1,
// item 11, which overrides the brief's "not a carousel" rule for this strip)
// and a wrapping grid from tablet up.
export default function Members() {
  return (
    <section className={styles.members} aria-labelledby="members-heading">
      <h2 className={styles.heading} id="members-heading">
        {membersHeading}
      </h2>
      <Slider className={styles.logos}>
        {members.map((logo) => (
          <li key={logo.src} className={styles.item}>
            {/* Loaded eagerly: five small files, and it keeps them in full-page
                screenshots taken without scrolling. */}
            <Image
              className={styles.logo}
              src={logo.src}
              width={logo.width}
              height={logo.height}
              alt={logo.alt}
              sizes="8rem"
              loading="eager"
            />
          </li>
        ))}
      </Slider>
    </section>
  );
}
