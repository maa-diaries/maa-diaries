import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import '../effects.css';

/**
 * GlobalEffects — mounts once at app root.
 * Adds: scroll-reveal observer, cursor glow, button ripples, ambient orbs.
 * Zero layout changes — purely additive visual layer.
 */
export const GlobalEffects: React.FC = () => {
  const { activePage } = useStore();

  /* ── 1. Scroll-Reveal Observer (runs only on page changes) ── */
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [activePage]);

  /* Ripple on button clicks is lightweight and can remain */

  return null;
};
