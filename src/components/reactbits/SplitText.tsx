'use client';

import React, { useRef, useEffect, useMemo, useSyncExternalStore } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | number[];
  splitType?: 'chars' | 'words' | 'lines';
  from?: Record<string, unknown>;
  to?: Record<string, unknown>;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 0.6,
  ease = [0.25, 0.46, 0.45, 0.94],
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '0px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
    margin: rootMargin
  });

  // Use useSyncExternalStore to track font loading without setState in effect
  const fontsLoaded = useSyncExternalStore(
    (callback) => {
      document.fonts.addEventListener('loadingdone', callback);
      document.fonts.addEventListener('loadingerror', callback);
      return () => {
        document.fonts.removeEventListener('loadingdone', callback);
        document.fonts.removeEventListener('loadingerror', callback);
      };
    },
    () => document.fonts.status === 'loaded',
    () => true // server snapshot: assume fonts loaded
  );

  const segments = useMemo(() => {
    if (!text || !fontsLoaded) return [];

    if (splitType === 'words') {
      return text.split(' ').map((word, i, arr) =>
        i < arr.length - 1 ? [word, ' '] : [word]
      ).flat();
    }

    if (splitType === 'lines') {
      // Simple line split by newline; for auto-line detection use words as fallback
      return text.split('\n').map((line, i, arr) =>
        i < arr.length - 1 ? [line, '\n'] : [line]
      ).flat();
    }

    // Default: chars
    return text.split('');
  }, [text, splitType, fontsLoaded]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay / 1000,
        delayChildren: 0
      }
    }
  };

  const childVariants: Variants = {
    hidden: from,
    visible: {
      ...to,
      duration,
      ease,
      transition: {
        duration,
        ease
      }
    }
  };

  const Tag = (tag || 'p') as React.ElementType;

  const onCompleteRef = useRef(onLetterAnimationComplete);
  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (isInView && fontsLoaded && segments.length > 0) {
      const timer = setTimeout(() => {
        onCompleteRef.current?.();
      }, (segments.length * delay) + duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, fontsLoaded, segments.length, delay, duration]);

  return (
    <Tag
      ref={ref}
      className={`overflow-hidden inline-block whitespace-normal ${className}`}
      style={{ textAlign, wordWrap: 'break-word' }}
    >
      {fontsLoaded && (
        <motion.span
          className="inline-block"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          aria-label={text}
        >
          {segments.map((segment, i) => {
            if (segment === ' ') {
              return (
                <motion.span
                  key={`space-${i}`}
                  className="inline-block"
                  variants={childVariants}
                  aria-hidden
                >
                  &nbsp;
                </motion.span>
              );
            }
            if (segment === '\n') {
              return <br key={`br-${i}`} />;
            }
            return (
              <motion.span
                key={`char-${i}-${segment}`}
                className="inline-block will-change-transform"
                variants={childVariants}
              >
                {segment}
              </motion.span>
            );
          })}
        </motion.span>
      )}
    </Tag>
  );
};

export default SplitText;
