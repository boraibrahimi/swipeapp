import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Principle, SwipeDirection } from '../types';
import { THEME } from '../constants';

interface SwipeCardProps {
  principle: Principle;
  index: number; // 0 is top card
  onSwipe: (direction: SwipeDirection) => void;
  isFront: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ principle, index, onSwipe, isFront }) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  
  // Visual transformations based on drag position
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Background card scaling logic
  const scale = 1 - index * 0.05;
  const yOffset = index * 10;
  
  // Indicators for Keep/Discard
  const keepOpacity = useTransform(x, [20, 100], [0, 1]);
  const discardOpacity = useTransform(x, [-100, -20], [1, 0]);

  useEffect(() => {
    // Animate stack position changes
    controls.start({
      scale: isFront ? 1 : scale,
      y: yOffset,
      opacity: 1,
      transition: { duration: 0.3 }
    });
  }, [index, isFront, scale, yOffset, controls]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
      await controls.start({ x: 500, transition: { duration: 0.2 } });
      onSwipe(SwipeDirection.RIGHT);
    } else if (info.offset.x < -threshold || velocity < -500) {
      await controls.start({ x: -500, transition: { duration: 0.2 } });
      onSwipe(SwipeDirection.LEFT);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div
      className="absolute top-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      style={{
        zIndex: 100 - index,
        x,
        rotate,
        opacity
      }}
      animate={controls}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`relative w-full h-[60vh] max-h-[600px] ${THEME.colors.card} border ${THEME.colors.border} rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 select-none overflow-hidden`}
      >
        {/* Swipe Indicators Overlay */}
        {isFront && (
          <>
            <motion.div 
              style={{ opacity: keepOpacity }}
              className="absolute top-8 left-8 border-4 border-emerald-500 rounded-lg px-4 py-2 rotate-[-15deg] pointer-events-none z-20"
            >
              <span className="text-3xl font-black text-emerald-500 uppercase tracking-widest">KEEP</span>
            </motion.div>
            
            <motion.div 
              style={{ opacity: discardOpacity }}
              className="absolute top-8 right-8 border-4 border-rose-500 rounded-lg px-4 py-2 rotate-[15deg] pointer-events-none z-20"
            >
              <span className="text-3xl font-black text-rose-500 uppercase tracking-widest">DISCARD</span>
            </motion.div>
          </>
        )}

        {/* Card Content */}
        <div className="absolute top-4 right-6 text-xs font-mono text-slate-600 uppercase tracking-widest">
          {principle.id.replace('-', ' #')}
        </div>

        <div className="text-center space-y-6 z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wide">
             {principle.category || 'Principle'}
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold leading-tight ${THEME.colors.textPrimary}`}>
            {principle.text}
          </h2>
        </div>

        {/* Decorative Bottom Bar */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
      </div>
    </motion.div>
  );
};