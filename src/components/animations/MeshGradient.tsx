/**
 * Mesh Gradient Background
 * Premium animated gradient background with blur effects
 */

import { motion } from 'framer-motion';
import { useThemeStore } from '@/context/themeStore';

export default function MeshGradient() {
  const { isDark } = useThemeStore();

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className={`absolute inset-0 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-purple-50'
      }`} />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] ${
          isDark 
            ? 'bg-primary-600/20' 
            : 'bg-primary-400/30'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -80, 40, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] ${
          isDark 
            ? 'bg-purple-600/15' 
            : 'bg-purple-400/25'
        }`}
      />

      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[80px] ${
          isDark 
            ? 'bg-accent-600/15' 
            : 'bg-accent-400/25'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -40, 80, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full blur-[60px] ${
          isDark 
            ? 'bg-cyan-600/10' 
            : 'bg-cyan-400/20'
        }`}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
