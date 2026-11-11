/**
 * AnimatedWrap Component
 * Framer Motion wrapper for entrance animations
 * Drop-in wrapper that doesn't affect layout
 */

import React from 'react';
import { motion } from 'framer-motion';

// Animation variants
const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  glitch: {
    initial: { opacity: 0, x: 0, y: 0 },
    animate: { 
      opacity: 1,
      x: [0, -2, 2, -1, 1, 0],
      y: [0, 2, -2, 1, -1, 0],
      transition: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    },
    exit: { opacity: 0 }
  },
  cyber: {
    initial: { opacity: 0, scaleX: 0.5, filter: 'blur(10px)' },
    animate: { 
      opacity: 1, 
      scaleX: 1, 
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] }
    },
    exit: { opacity: 0, scaleX: 0.5, filter: 'blur(10px)' }
  }
};

// Transition presets
const transitionPresets = {
  smooth: { duration: 0.3, ease: 'easeOut' },
  snappy: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  bounce: { duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] },
  cyber: { duration: 0.4, ease: [0.6, 0.01, 0.05, 0.95] }
};

const AnimatedWrap = ({ 
  children, 
  variant = 'fadeIn', 
  transition = 'smooth',
  delay = 0,
  duration,
  className = '',
  style = {},
  stagger = false,
  staggerDelay = 0.1,
  ...props 
}) => {
  const selectedVariant = variants[variant] || variants.fadeIn;
  const selectedTransition = duration 
    ? { duration } 
    : transitionPresets[transition] || transitionPresets.smooth;

  // If stagger is enabled and children is an array
  if (stagger && React.Children.count(children) > 1) {
    return (
      <motion.div
        className={className}
        style={style}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          animate: {
            transition: {
              staggerChildren: staggerDelay
            }
          }
        }}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={selectedVariant}
            transition={{ ...selectedTransition, delay: delay + (index * staggerDelay) }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={selectedVariant}
      transition={{ ...selectedTransition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrap;

// CSS Fallback version (for environments without Framer Motion)
export const AnimatedWrapCSS = ({ 
  children, 
  variant = 'fadeIn', 
  className = '',
  style = {},
  ...props 
}) => {
  const cssVariantClass = `animate-${variant}`;
  
  return (
    <div 
      className={`${cssVariantClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

// CSS animations (add to theme.css or separate animation.css)
export const cssAnimations = `
/* Fallback CSS Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
.animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
.animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
.animate-slideLeft { animation: slideLeft 0.3s ease-out forwards; }
.animate-slideRight { animation: slideRight 0.3s ease-out forwards; }
.animate-scale { animation: scale 0.3s ease-out forwards; }

@media (prefers-reduced-motion: reduce) {
  .animate-fadeIn,
  .animate-slideUp,
  .animate-slideDown,
  .animate-slideLeft,
  .animate-slideRight,
  .animate-scale {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;
