'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function randomChar(scrambleChars: string): string {
  return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
}

const ScrambledText: React.FC<ScrambledTextProps> = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) => {
  // Compute original text from children
  const originalText = useMemo(() => {
    if (typeof children === 'string') return children;
    return React.Children.toArray(children)
      .map((child) => (typeof child === 'string' ? child : ''))
      .join('');
  }, [children]);

  // Use the originalText as a key to reset the inner component when it changes
  return (
    <ScrambledTextInner
      key={originalText}
      originalText={originalText}
      radius={radius}
      duration={duration}
      speed={speed}
      scrambleChars={scrambleChars}
      className={className}
      style={style}
    />
  );
};

interface ScrambledTextInnerProps {
  originalText: string;
  radius: number;
  duration: number;
  speed: number;
  scrambleChars: string;
  className: string;
  style: React.CSSProperties;
}

function ScrambledTextInner({
  originalText,
  radius,
  duration,
  speed,
  scrambleChars,
  className,
  style
}: ScrambledTextInnerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState<string>(originalText);
  const animatingCharsRef = useRef<Set<number>>(new Set());
  const animationFramesRef = useRef<Map<number, number>>(new Map());

  const scrambleChar = useCallback(
    (index: number) => {
      if (animatingCharsRef.current.has(index)) return;
      animatingCharsRef.current.add(index);

      const originalChar = originalText[index];
      const startTime = performance.now();
      const totalDuration = duration * 1000;
      const stepInterval = 1000 / (speed * 30);

      let lastStep = 0;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);

        if (progress < 1) {
          if (elapsed - lastStep > stepInterval) {
            setDisplayText((prev) => {
              const chars = prev.split('');
              if (index < chars.length) {
                chars[index] = progress > 0.7 ? originalChar : randomChar(scrambleChars);
              }
              return chars.join('');
            });
            lastStep = elapsed;
          }
          animationFramesRef.current.set(index, requestAnimationFrame(animate));
        } else {
          setDisplayText((prev) => {
            const chars = prev.split('');
            if (index < chars.length) {
              chars[index] = originalChar;
            }
            return chars.join('');
          });
          animatingCharsRef.current.delete(index);
          animationFramesRef.current.delete(index);
        }
      };

      animationFramesRef.current.set(index, requestAnimationFrame(animate));
    },
    [originalText, duration, speed, scrambleChars]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!rootRef.current) return;

      const rect = rootRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const text = originalText;
      const charWidth = rect.width / Math.max(text.length, 1);
      const textHeight = rect.height;

      for (let i = 0; i < text.length; i++) {
        const charX = charWidth * i + charWidth / 2;
        const charY = textHeight / 2;
        const dist = Math.hypot(mouseX - charX, mouseY - charY);

        if (dist < radius && text[i] !== ' ') {
          scrambleChar(i);
        }
      }
    },
    [radius, originalText, scrambleChar]
  );

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      animationFramesRef.current.forEach((frame) => cancelAnimationFrame(frame));
      animationFramesRef.current.clear();
    };
  }, []);

  return (
    <div ref={rootRef} onPointerMove={handlePointerMove} className={`font-mono ${className}`} style={style}>
      <p aria-label={originalText}>{displayText}</p>
    </div>
  );
}

export default ScrambledText;
