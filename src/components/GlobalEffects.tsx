import { useEffect } from 'react';
import '../effects.css';

/**
 * GlobalEffects — mounts once at app root.
 * Adds: scroll-reveal observer, cursor glow, button ripples, ambient orbs.
 * Zero layout changes — purely additive visual layer.
 */
export const GlobalEffects: React.FC = () => {

  /* ── 1. Scroll-Reveal Observer ─────────────────────── */
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
  });

  /* ── 2. Cursor Glow ────────────────────────────────── */
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip mobile

    const orb = document.createElement('div');
    orb.id = 'cursor-glow';
    document.body.appendChild(orb);

    const move = (e: MouseEvent) => {
      orb.style.left = `${e.clientX}px`;
      orb.style.top  = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      orb.remove();
    };
  }, []);

  /* ── 3. Ripple on every button click ───────────────── */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const btn = (e.target as Element).closest('button');
      if (!btn) return;
      if (btn.classList.contains('no-ripple')) return;

      btn.classList.add('ripple-container');
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      const rect = btn.getBoundingClientRect();
      wave.style.left = `${e.clientX - rect.left}px`;
      wave.style.top  = `${e.clientY - rect.top}px`;
      btn.appendChild(wave);
      setTimeout(() => wave.remove(), 600);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  /* ── 4. Ambient Background Orbs ────────────────────── */
  useEffect(() => {
    const configs = [
      { color: 'rgba(191,165,117,0.22)', size: 420, left: '5%',  top: '15%',  delay: '0s' },
      { color: 'rgba(131,39,41,0.13)',   size: 500, right: '3%', top: '40%',  delay: '-6s' },
      { color: 'rgba(191,165,117,0.15)', size: 360, left: '40%', bottom: '10%', delay: '-12s' },
    ];

    const orbs = configs.map((cfg) => {
      const el = document.createElement('div');
      el.className = 'ambient-orb';
      el.style.width  = `${cfg.size}px`;
      el.style.height = `${cfg.size}px`;
      el.style.background = `radial-gradient(circle, ${cfg.color}, transparent 70%)`;
      if (cfg.left)   el.style.left   = cfg.left;
      if (cfg.right)  el.style.right  = (cfg as any).right;
      if (cfg.top)    el.style.top    = cfg.top;
      if (cfg.bottom) el.style.bottom = (cfg as any).bottom;
      el.style.animationDelay = cfg.delay;
      document.body.appendChild(el);
      return el;
    });

    return () => orbs.forEach((o) => o.remove());
  }, []);

  return null;
};
