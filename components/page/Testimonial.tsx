import styles from './Testimonial.module.css';

export default function Testimonial({ text }: { text: string }) {
  return (
    <div className={styles.band}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
