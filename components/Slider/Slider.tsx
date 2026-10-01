'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronIcon } from '../icons';
import styles from './Slider.module.css';

type Props = {
  children: React.ReactNode; // <li> elements
  className?: string; // sets the --slider-* variables for this use
  label?: string;
  // From desktop up, stay a slider instead of becoming a grid, with previous
  // and next buttons for people without a touch screen. The strings are the
  // buttons' accessible names.
  arrows?: { previous: string; next: string };
};

// Shared horizontal slider. Native scrolling with CSS scroll-snap: one row,
// the next slide peeking in as a cue on phones, no autoplay. From tablet up
// it is a normal grid, unless `arrows` is set, in which case it is a slider
// again from desktop up.
//
// The list is only made focusable while it actually scrolls, so keyboard
// users can scroll it with the arrow keys without an empty tab stop where it
// is a grid.
export default function Slider({ children, className, label, arrows }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const update = () => {
      setScrollable(list.scrollWidth > list.clientWidth + 1);
      setAtStart(list.scrollLeft <= 1);
      setAtEnd(list.scrollLeft + list.clientWidth >= list.scrollWidth - 1);
    };
    const observer = new ResizeObserver(update);
    observer.observe(list);
    list.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener('scroll', update);
    };
  }, []);

  // Move by one slide; scroll-snap lands it on the slide's edge.
  function move(direction: 1 | -1) {
    const list = ref.current;
    const first = list?.firstElementChild;
    if (!list || !first) return;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({
      left: direction * (first.getBoundingClientRect().width + gap),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }

  const list = (
    <ul
      ref={ref}
      className={[styles.slider, arrows && styles.desktopSlider, className].filter(Boolean).join(' ')}
      aria-label={label}
      tabIndex={scrollable ? 0 : undefined}
    >
      {children}
    </ul>
  );
  if (!arrows) return list;

  // The wrapper has no box of its own below desktop (display: contents), so
  // the phone and tablet layouts are exactly as they are without it. The
  // buttons use aria-disabled rather than disabled at each end, so a keyboard
  // user who reaches the end keeps their focus on the button.
  return (
    <div className={styles.frame}>
      {list}
      <button
        type="button"
        className={`${styles.arrow} ${styles.previous}`}
        aria-label={arrows.previous}
        aria-disabled={atStart}
        onClick={() => !atStart && move(-1)}
      >
        <ChevronIcon className={styles.arrowIcon} />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.next}`}
        aria-label={arrows.next}
        aria-disabled={atEnd}
        onClick={() => !atEnd && move(1)}
      >
        <ChevronIcon className={styles.arrowIcon} />
      </button>
    </div>
  );
}
