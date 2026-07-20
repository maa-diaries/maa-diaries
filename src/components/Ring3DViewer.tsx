import React, { useState, useRef, useEffect } from 'react';

interface Ring3DViewerProps {
  metal: string; // '18k Yellow Gold' | 'Platinum' | '18k Rose Gold'
  gemCut: string; // 'Round' | 'Princess' | 'Emerald' | 'Pear' | 'Oval'
  gemType?: 'diamond' | 'emerald' | 'sapphire' | 'ruby';
  carat?: number; // 0.5 to 3.0
  engraving?: string;
  autoRotate?: boolean;
}

export const Ring3DViewer: React.FC<Ring3DViewerProps> = ({
  metal,
  gemCut,
  gemType = 'diamond',
  carat = 1.0,
  engraving = '',
  autoRotate = true
}) => {
  const [rotationY, setRotationY] = useState(45);
  const [rotationX, setRotationX] = useState(-15);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<{ y: number; x: number }>({ y: 0, x: 0 });
  const autoRotateRef = useRef<boolean>(autoRotate);

  // Sparkles state
  const [sparkles, setSparkles] = useState<{ id: number; top: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    autoRotateRef.current = autoRotate && !isDragging;
  }, [autoRotate, isDragging]);

  // Handle auto rotation
  useEffect(() => {
    let animationId: number;
    const rotate = () => {
      if (autoRotateRef.current) {
        setRotationY(prev => (prev + 0.5) % 360);
      }
      animationId = requestAnimationFrame(rotate);
    };
    rotate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Generate random sparkles around the gemstone
  useEffect(() => {
    const list = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      top: -30 + Math.random() * 40,
      left: -30 + Math.random() * 60,
      delay: Math.random() * 2
    }));
    setSparkles(list);
  }, [gemCut, gemType, metal]);

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotationStartRef.current = { y: rotationY, x: rotationX };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    // Rotate faster horizontally, slower vertically
    setRotationY(rotationStartRef.current.y + deltaX * 0.8);
    setRotationX(Math.max(-45, Math.min(25, rotationStartRef.current.x - deltaY * 0.4)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    rotationStartRef.current = { y: rotationY, x: rotationX };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    setRotationY(rotationStartRef.current.y + deltaX * 0.8);
    setRotationX(Math.max(-45, Math.min(25, rotationStartRef.current.x - deltaY * 0.4)));
  };

  // Metal Color Mapping
  const getMetalGradients = () => {
    if (metal.includes('Yellow Gold')) {
      return {
        main: 'linear-gradient(135deg, #f3e5ab 0%, #d4af37 60%, #b8972e 100%)',
        border: '#d4af37',
        highlight: 'rgba(255, 255, 255, 0.4)',
        shadow: '#7a5e11'
      };
    } else if (metal.includes('Rose Gold')) {
      return {
        main: 'linear-gradient(135deg, #f4d0c2 0%, #e09f80 60%, #b8775c 100%)',
        border: '#e09f80',
        highlight: 'rgba(255, 255, 255, 0.35)',
        shadow: '#804c35'
      };
    } else {
      // Platinum / White Gold
      return {
        main: 'linear-gradient(135deg, #f5f5f7 0%, #d5d5d7 60%, #a1a1a6 100%)',
        border: '#d5d5d7',
        highlight: 'rgba(255, 255, 255, 0.5)',
        shadow: '#5c5c60'
      };
    }
  };

  const metalGrad = getMetalGradients();

  // Gemstone Color Mapping
  const getGemColors = () => {
    switch (gemType) {
      case 'emerald':
        return {
          primary: '#2ecc71',
          dark: '#1e8449',
          light: '#a9dfbf',
          glow: 'rgba(46, 204, 113, 0.6)'
        };
      case 'sapphire':
        return {
          primary: '#2980b9',
          dark: '#1b4f72',
          light: '#a9cce3',
          glow: 'rgba(41, 128, 185, 0.6)'
        };
      case 'ruby':
        return {
          primary: '#e74c3c',
          dark: '#7b241c',
          light: '#f5b7b1',
          glow: 'rgba(231, 76, 60, 0.6)'
        };
      case 'diamond':
      default:
        return {
          primary: '#e6f2ff',
          dark: '#aab7b8',
          light: '#ffffff',
          glow: 'rgba(255, 255, 255, 0.7)'
        };
    }
  };

  const gemColor = getGemColors();

  // Base sizing multipliers
  const scale = 0.8 + (carat - 0.5) * 0.15; // scales diamond size based on carat

  // Render faceted cuts in SVGs to support high-fidelity shining faces
  const renderGemstoneSVG = () => {
    const size = 110 * scale;

    switch (gemCut.toLowerCase()) {
      case 'emerald':
        // Octagonal emerald cut facets
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 15px ${gemColor.glow})` }}>
            {/* Outer facet ring */}
            <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill={gemColor.dark} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
            {/* Mid facets */}
            <polygon points="35,20 65,20 80,35 80,65 65,80 35,80 20,65 20,35" fill={gemColor.primary} stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
            {/* Center table */}
            <polygon points="40,30 60,30 70,40 70,60 60,70 40,70 30,60 30,40" fill={gemColor.light} stroke="rgba(255,255,255,0.7)" strokeWidth="0.5"/>
            {/* Top Table reflection glint */}
            <polygon points="40,30 55,30 45,45 35,40" fill="rgba(255,255,255,0.8)" opacity="0.6" />
          </svg>
        );
      case 'princess':
        // Square cut facets
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 15px ${gemColor.glow})` }}>
            <rect x="10" y="10" width="80" height="80" fill={gemColor.dark} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
            {/* X-Facets */}
            <polygon points="10,10 50,50 90,10" fill={gemColor.light} opacity="0.3" stroke="rgba(255,255,255,0.3)"/>
            <polygon points="90,10 50,50 90,90" fill={gemColor.primary} opacity="0.6" stroke="rgba(255,255,255,0.3)"/>
            <polygon points="90,90 50,50 10,90" fill={gemColor.dark} opacity="0.8" stroke="rgba(255,255,255,0.3)"/>
            <polygon points="10,90 50,50 10,10" fill={gemColor.primary} opacity="0.5" stroke="rgba(255,255,255,0.3)"/>
            {/* Inner diamond table */}
            <polygon points="30,30 70,30 70,70 30,70" fill={gemColor.light} stroke="rgba(255,255,255,0.7)" strokeWidth="0.5"/>
            {/* Light glare */}
            <polygon points="30,30 50,30 40,45 30,40" fill="rgba(255,255,255,0.8)" opacity="0.6" />
          </svg>
        );
      case 'pear':
        // Teardrop cut facets
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 15px ${gemColor.glow})` }}>
            <path d="M50,10 C75,45 85,65 80,80 C75,93 60,95 50,95 C40,95 25,93 20,80 C15,65 25,45 50,10 Z" fill={gemColor.dark} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
            {/* Facets radiating from point */}
            <polygon points="50,10 50,95 80,80" fill={gemColor.primary} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            <polygon points="50,10 50,95 20,80" fill={gemColor.dark} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            {/* Inner pear table */}
            <path d="M50,30 C65,55 70,68 68,78 C65,85 58,87 50,87 C42,87 35,85 32,78 C30,68 35,55 50,30 Z" fill={gemColor.light} stroke="rgba(255,255,255,0.7)" strokeWidth="0.5"/>
            {/* Glare */}
            <path d="M50,30 C58,45 60,52 58,60 C50,60 45,45 50,30 Z" fill="rgba(255,255,255,0.8)" opacity="0.6"/>
          </svg>
        );
      case 'oval':
        // Oval cut facets
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 15px ${gemColor.glow})` }}>
            <ellipse cx="50" cy="50" rx="35" ry="45" fill={gemColor.dark} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            {/* Radiating facets */}
            <polygon points="50,5 50,95 85,50" fill={gemColor.primary} stroke="rgba(255,255,255,0.3)"/>
            <polygon points="50,5 50,95 15,50" fill={gemColor.dark} stroke="rgba(255,255,255,0.3)"/>
            {/* Center table */}
            <ellipse cx="50" cy="50" rx="20" ry="28" fill={gemColor.light} stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
            <path d="M38,38 Q50,45 62,38 Q50,55 38,38" fill="rgba(255,255,255,0.8)" opacity="0.5"/>
          </svg>
        );
      case 'round':
      default:
        // Round brilliant cut facets (classic starburst)
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 15px ${gemColor.glow})` }}>
            <circle cx="50" cy="50" r="45" fill={gemColor.dark} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
            {/* Triangle starburst facets */}
            {Array.from({ length: 8 }).map((_, idx) => {
              const angle = (idx * Math.PI) / 4;
              const nextAngle = ((idx + 1) * Math.PI) / 4;
              const x1 = 50 + Math.cos(angle) * 45;
              const y1 = 50 + Math.sin(angle) * 45;
              const x2 = 50 + Math.cos(nextAngle) * 45;
              const y2 = 50 + Math.sin(nextAngle) * 45;
              const fill = idx % 2 === 0 ? gemColor.primary : gemColor.dark;
              return (
                <polygon 
                  key={idx} 
                  points={`50,50 ${x1},${y1} ${x2},${y2}`} 
                  fill={fill} 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeWidth="0.5"
                />
              );
            })}
            {/* Center table */}
            <circle cx="50" cy="50" r="23" fill={gemColor.light} stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"/>
            {/* Table facets */}
            <polygon points="50,27 65,40 50,50" fill="rgba(255,255,255,0.3)"/>
            <polygon points="35,40 50,27 50,50" fill="rgba(255,255,255,0.5)"/>
            {/* Reflection sweep */}
            <path d="M35,35 Q50,45 65,35 Q50,50 35,35" fill="rgba(255,255,255,0.8)" opacity="0.6"/>
          </svg>
        );
    }
  };

  // Stacked divs along Z axis to create thickness in CSS 3D
  const render3DBandCircles = () => {
    const ringRadius = 90; // size of the ring
    const depth = 22; // thickness slices
    const circles = [];

    for (let i = 0; i < depth; i++) {
      const zOffset = -depth / 2 + i;
      const opacity = i === 0 || i === depth - 1 ? 1 : 0.85; // Solid walls
      circles.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${ringRadius * 2}px`,
            height: `${ringRadius * 2}px`,
            marginLeft: `-${ringRadius}px`,
            marginTop: `-${ringRadius}px`,
            borderRadius: '50%',
            border: `6px solid ${metalGrad.border}`,
            background: 'transparent',
            boxShadow: `inset 0 0 10px ${metalGrad.shadow}`,
            transform: `translateZ(${zOffset}px)`,
            opacity: opacity,
            pointerEvents: 'none'
          }}
        />
      );
    }
    return circles;
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      style={{
        width: '100%',
        height: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        userSelect: 'none',
        perspective: '800px',
        overflow: 'hidden'
      }}
    >
      {/* Sparkles around gem */}
      {sparkles.map(s => (
        <div 
          key={s.id} 
          className="sparkle"
          style={{
            top: `calc(35% + ${s.top}px)`,
            left: `calc(50% + ${s.left}px)`,
            animationDelay: `${s.delay}s`,
            zIndex: 100
          }}
        />
      ))}

      {/* 3D Ring Object Rotator */}
      <div style={{
        width: '200px',
        height: '200px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}>
        
        {/* The Metal Band slices */}
        {render3DBandCircles()}

        {/* Outer Highlight glare ring (horizontal shine) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '180px',
          height: '180px',
          marginLeft: '-90px',
          marginTop: '-90px',
          borderRadius: '50%',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.4)',
          transform: 'translateZ(12px)',
          pointerEvents: 'none',
          opacity: 0.35
        }} />

        {/* Gemstone Setting mount on top (Z-axis offset) */}
        <div style={{
          position: 'absolute',
          top: '0%', // Mounts at 12 o'clock on the ring circle
          left: '50%',
          width: '45px',
          height: '45px',
          marginLeft: '-22.5px',
          marginTop: '-15px',
          background: metalGrad.main,
          border: `1.5px solid ${metalGrad.border}`,
          borderRadius: '4px',
          transform: 'rotateX(-90deg) translateZ(0px) translateY(-85px)',
          transformStyle: 'preserve-3d',
          boxShadow: `0 4px 10px ${metalGrad.shadow}`
        }}>
          {/* Prong 1 */}
          <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '6px', height: '6px', background: metalGrad.border, borderRadius: '50%', transform: 'translateZ(6px)' }} />
          {/* Prong 2 */}
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '6px', height: '6px', background: metalGrad.border, borderRadius: '50%', transform: 'translateZ(6px)' }} />
          {/* Prong 3 */}
          <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '6px', height: '6px', background: metalGrad.border, borderRadius: '50%', transform: 'translateZ(6px)' }} />
          {/* Prong 4 */}
          <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '6px', height: '6px', background: metalGrad.border, borderRadius: '50%', transform: 'translateZ(6px)' }} />
        </div>

        {/* Actual Gemstone graphic sitting on top of the mount */}
        <div style={{
          position: 'absolute',
          top: '0%',
          left: '50%',
          transform: 'rotateX(-90deg) translateY(-85px) translateZ(28px)', // Extrudes gem outward from mount
          transformStyle: 'preserve-3d',
          marginLeft: `calc(-55px * ${scale})`,
          marginTop: `calc(-55px * ${scale})`,
          pointerEvents: 'none'
        }}>
          {renderGemstoneSVG()}
        </div>

        {/* Engraving text inside the ring */}
        {engraving && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateZ(-1px) rotateX(90deg) translateY(-30px)',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.45rem',
            fontFamily: 'monospace',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            width: '180px',
            textAlign: 'center',
            marginLeft: '-90px',
            pointerEvents: 'none'
          }}>
            {engraving}
          </div>
        )}
      </div>

      {/* Swipe drag overlay guidance */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        fontSize: '0.7rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>← Drag to Spin 360° →</span>
      </div>

      {/* Shine/Glint CSS layer */}
      <style>{`
        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: radial-gradient(circle, #fff 10%, var(--gold-primary) 50%, transparent 100%);
          animation: sparkle 1.5s infinite ease-in-out;
          pointer-events: none;
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
