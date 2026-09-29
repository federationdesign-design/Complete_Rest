import Image from 'next/image';
import { members, membersHeading } from '../../lib/members';
import styles from './Members.module.css';

// Wrapping grid of membership logos (not a carousel).
export default function Members() {
  return (
    <section className={styles.members} aria-labelledby="members-heading">
      <h2 className={styles.heading} id="members-heading">
        {membersHeading}
      </h2>
      <ul className={styles.grid}>
        {members.map((logo) => (
          <li key={logo.src} className={styles.item}>
            <Image className={styles.logo} src={logo.src} width={logo.width} height={logo.height} alt={logo.alt} sizes="8rem" />
          </li>
        ))}
      </ul>
    </section>
  );
}
