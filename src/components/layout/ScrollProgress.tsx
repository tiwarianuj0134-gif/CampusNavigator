import { motion, useScroll } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-16 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6b5fff] via-[#a855f7] to-[#06b6d4] z-50 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
