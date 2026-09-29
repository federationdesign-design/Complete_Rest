import Image from 'next/image';
import HeaderSentinel from '../components/HeaderSentinel/HeaderSentinel';
import styles from './page.module.css';

// Temporary home page used to check the layout shell (step 2).
// Replaced by the home template in step 3.
export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <Image
          className={styles.heroImage}
          src="/images/hoempage-image.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className={styles.heroText}>
          <h1>The Complete Restoration company</h1>
          <p>A professional and comprehensive service for the restoration of period buildings</p>
        </div>
      </section>
      <HeaderSentinel />
      <div className={styles.body}>
        <p>
          The Complete Restoration Company are award winning experts in the field of building restoration and
          conservation. Our high quality work can be seen all over Hertfordshire and London.
        </p>
      </div>
    </>
  );
}
