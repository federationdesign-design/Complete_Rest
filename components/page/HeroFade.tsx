'use client';

import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

// Hero fade on scroll, ported from the LHM site (PrivateHomeClient.tsx,
// heroScrollOverlay). A layer between the image and the text, in the header
// grey (black on LHM), goes from transparent to solid as the visitor scrolls
// from 10% to 65% of the hero's height, so the image fades out behind the
// heading.
//
// Changes from LHM: updates are batched with requestAnimationFrame, the
// distance is measured from the hero itself (this site has a header above
// it), and there is no fade when prefers-reduced-motion is set.
export default function HeroFade() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = ref.current;
    const hero = overlay?.parentElement;
    if (!overlay || !hero) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        overlay.style.opacity = '0';
        return;
      }
      const height = hero.offsetHeight;
      const scrolled = -hero.getBoundingClientRect().top;
      const start = height * 0.1;
      const range = height * 0.55;
      overlay.style.opacity = scrolled <= start ? '0' : String(Math.min((scrolled - start) / range, 1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    reducedMotion.addEventListener('change', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      reducedMotion.removeEventListener('change', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className={styles.fade} aria-hidden="true" />;
}
