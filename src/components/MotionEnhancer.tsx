import { useEffect } from 'react';

/** Adds progressive, non-layout-changing motion to the existing storefront. */
export const MotionEnhancer = () => {
  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(
      '.home-page > div, .page-shell > *, .product-grid > *, .about-difference-card, .account-stat, .order-card'
    ));

    revealTargets.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 70, 350)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -28px' }
    );
    revealTargets.forEach((element) => observer.observe(element));

    const tiltTargets = Array.from(document.querySelectorAll<HTMLElement>(
      '.product-card, .shop-card, .home-product-carousel > div'
    ));
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onMove = (event: MouseEvent) => {
      const card = event.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${(-y * 3).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 3).toFixed(2)}deg`);
      card.classList.add('has-tilt');
    };
    const onLeave = (event: MouseEvent) => {
      const card = event.currentTarget as HTMLElement;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.classList.remove('has-tilt');
    };
    if (canHover) tiltTargets.forEach((card) => {
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });

    return () => {
      observer.disconnect();
      tiltTargets.forEach((card) => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return null;
};
