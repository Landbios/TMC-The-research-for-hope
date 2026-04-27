'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DiceAnimationProps {
  onComplete?: () => void;
}

export function DiceAnimation({ onComplete }: DiceAnimationProps) {
  const [faces, setFaces] = useState([1, 2, 3, 4, 5, 20]);
  const [currentFace, setCurrentFace] = useState(20);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setCurrentFace(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count > 15) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Outer Hexagon (D20-like shape) */}
      <motion.div 
        animate={{ 
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.2, 1],
          filter: [
            'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))',
            'drop-shadow(0 0 30px rgba(245, 158, 11, 0.8))',
            'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))'
          ]
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute w-full h-full bg-amber-600/20 border-2 border-amber-500"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      />
      
      {/* Inner segments */}
      <div className="absolute inset-2 border border-amber-500/30" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />

      <motion.span 
        key={currentFace}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="font-mono text-3xl font-black text-amber-500 z-10"
      >
        {currentFace}
      </motion.span>

      {/* Particle burst effect */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2], opacity: [0, 1, 0] }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute w-full h-full rounded-full border border-amber-400"
      />
    </div>
  );
}
