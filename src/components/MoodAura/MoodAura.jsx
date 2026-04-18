import React, { useEffect, useState, useRef, useMemo } from 'react';
import { analyzeConversationMood, getMoodTheme } from '../../utils/sentimentAnalyzer';

const PARTICLE_COUNT = 18;

function MoodParticle({ color, index }) {
  const style = useMemo(() => {
    const size = 2 + Math.random() * 4;
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * duration;
    const drift = -20 + Math.random() * 40;
    return {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      left: `${left}%`,
      bottom: '-5%',
      opacity: 0,
      filter: `blur(${size > 4 ? 1 : 0}px)`,
      animation: `moodParticleRise ${duration}s ${delay}s ease-in infinite`,
      '--drift': `${drift}px`,
      pointerEvents: 'none',
    };
  }, [color, index]);

  return <div style={style} />;
}

const MoodAura = ({ messages, children }) => {
  const [mood, setMood] = useState('neutral');
  const [prevMood, setPrevMood] = useState('neutral');
  const debounceRef = useRef(null);

  // Recompute mood when messages change (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const newMood = analyzeConversationMood(messages, 8);
      if (newMood !== mood) {
        setPrevMood(mood);
        setMood(newMood);
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [messages]);

  const theme = getMoodTheme(mood);
  const isActive = mood !== 'neutral';

  return (
    <div className="mood-aura-wrapper" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      {/* Ambient background layer */}
      <div
        className="mood-aura-bg"
        style={{
          position: 'absolute',
          inset: 0,
          background: theme.gradient,
          transition: 'background 1.2s ease-in-out',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Glow orb — center */}
      {isActive && (
        <div
          className="mood-aura-glow"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glowColor}, transparent 70%)`,
            transition: 'all 1.5s ease-in-out',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'moodGlowPulse 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Floating particles */}
      {isActive && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <MoodParticle key={`${mood}-${i}`} color={theme.particleColor} index={i} />
          ))}
        </div>
      )}

      {/* Mood label badge */}
      {isActive && theme.label && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            background: theme.glowColor,
            border: `1px solid ${theme.accentBorder}`,
            fontSize: 11,
            fontWeight: 700,
            color: theme.particleColor,
            letterSpacing: '0.02em',
            pointerEvents: 'none',
          }}
        >
          <span>{theme.emoji}</span>
          <span>{theme.label}</span>
        </div>
      )}

      {/* Actual content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default MoodAura;
