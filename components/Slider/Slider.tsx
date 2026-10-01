'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Slider.module.css';

type Props = {
  children: React.ReactNode; // <li> elements
  className?: string; // sets the --slider-* variables for this use
  label?: string;
};

// Shared horizontal swipe slider for phones (mobile round 1). Native
// scrolling with CSS scroll-snap: one row, the next slide peeking in as a cue,
// no autoplay and no arrows. From tablet up it is a normal grid.
//
// The list is only made focusable while it actually scrolls, so keyboard
// users can scroll it with the arrow keys without an empty tab stop on
// larger screens.
export default function Slider({ children, className, label }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const observer = new ResizeObserver(() => setScrollable(list.scrollWidth > list.clientWidth + 1));
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <ul
      ref={ref}
      className={className ? `${styles.slider} ${className}` : styles.slider}
      aria-label={label}
      tabIndex={scrollable ? 0 : undefined}
    >
      {children}
    </ul>
  );
}
