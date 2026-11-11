/**
 * AnimatedButton Component
 * Drop-in replacement for MUI Button with cyberpunk animations
 * Fully compatible with existing button props
 */

import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Styled button with cyberpunk effects
const CyberButton = styled(Button)(({ theme, cybertheme = 'pink' }) => {
  const themeColors = {
    pink: {
      main: '#ff0080',
      glow: 'rgba(255, 0, 128, 0.4)',
      shadow: '0 0 20px rgba(255, 0, 128, 0.6)',
    },
    blue: {
      main: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.4)',
      shadow: '0 0 20px rgba(0, 240, 255, 0.6)',
    },
    purple: {
      main: '#bd00ff',
      glow: 'rgba(189, 0, 255, 0.4)',
      shadow: '0 0 20px rgba(189, 0, 255, 0.6)',
    },
    green: {
      main: '#39ff14',
      glow: 'rgba(57, 255, 20, 0.4)',
      shadow: '0 0 20px rgba(57, 255, 20, 0.6)',
    },
  };

  const colors = themeColors[cybertheme] || themeColors.pink;

  return {
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&.MuiButton-contained': {
      background: `linear-gradient(135deg, ${colors.main} 0%, ${colors.main}dd 100%)`,
      color: '#ffffff',
      border: `2px solid ${colors.main}`,
      boxShadow: `0 4px 15px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
      
      '&:hover': {
        background: `linear-gradient(135deg, ${colors.main}ee 0%, ${colors.main} 100%)`,
        boxShadow: `0 6px 25px ${colors.glow}, ${colors.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
        transform: 'translateY(-2px)',
      },
      
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: `0 2px 10px ${colors.glow}`,
      },
    },
    
    '&.MuiButton-outlined': {
      background: 'transparent',
      color: colors.main,
      border: `2px solid ${colors.main}`,
      boxShadow: `inset 0 0 20px ${colors.glow}`,
      
      '&:hover': {
        background: `${colors.main}11`,
        borderColor: colors.main,
        boxShadow: `inset 0 0 30px ${colors.glow}, 0 0 20px ${colors.glow}`,
        transform: 'translateY(-2px)',
      },
      
      '&:active': {
        transform: 'translateY(0)',
      },
    },
    
    '&.MuiButton-text': {
      color: colors.main,
      
      '&:hover': {
        background: `${colors.main}11`,
        textShadow: `0 0 10px ${colors.main}`,
      },
    },
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
      transition: 'left 0.5s',
    },
    
    '&:hover::before': {
      left: '100%',
    },
  };
});

// Motion wrapper for Framer Motion animations
const MotionButton = motion(CyberButton);

const AnimatedButton = ({ 
  children, 
  cybertheme = 'pink',
  glitchEffect = false,
  pulseEffect = false,
  variant = 'contained',
  className = '',
  onClick,
  disabled = false,
  ...props 
}) => {
  // Glitch animation variants
  const glitchVariants = {
    hover: {
      x: [0, -2, 2, -1, 1, 0],
      transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    }
  };

  // Pulse animation
  const pulseVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const buttonVariants = glitchEffect ? glitchVariants : {};
  
  return (
    <MotionButton
      cybertheme={cybertheme}
      variant={variant}
      className={`animated-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      variants={buttonVariants}
      whileHover={glitchEffect ? 'hover' : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={pulseEffect ? pulseVariants.animate : {}}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export default AnimatedButton;

// CSS-only fallback version (no Framer Motion)
export const AnimatedButtonCSS = styled(Button)(({ cybertheme = 'pink' }) => {
  const themeColors = {
    pink: { main: '#ff0080', glow: 'rgba(255, 0, 128, 0.4)', shadow: '0 0 20px rgba(255, 0, 128, 0.6)' },
    blue: { main: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', shadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
    purple: { main: '#bd00ff', glow: 'rgba(189, 0, 255, 0.4)', shadow: '0 0 20px rgba(189, 0, 255, 0.6)' },
    green: { main: '#39ff14', glow: 'rgba(57, 255, 20, 0.4)', shadow: '0 0 20px rgba(57, 255, 20, 0.6)' },
  };

  const colors = themeColors[cybertheme] || themeColors.pink;

  return {
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&.MuiButton-contained': {
      background: `linear-gradient(135deg, ${colors.main} 0%, ${colors.main}dd 100%)`,
      color: '#ffffff',
      border: `2px solid ${colors.main}`,
      boxShadow: `0 4px 15px ${colors.glow}`,
      
      '&:hover': {
        background: `linear-gradient(135deg, ${colors.main}ee 0%, ${colors.main} 100%)`,
        boxShadow: `0 6px 25px ${colors.glow}, ${colors.shadow}`,
        transform: 'translateY(-2px) scale(1.05)',
      },
    },
    
    '&:active': {
      transform: 'translateY(0) scale(0.95)',
    },
  };
});
