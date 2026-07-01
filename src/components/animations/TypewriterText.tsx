import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  words: string[];
  className?: string;
}

export default function TypewriterText({ words, className = '' }: TypewriterTextProps) {
  const [currentWord, setCurrentWord] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(word.slice(0, displayed.length + 1));
        if (displayed.length === word.length) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setDisplayed(word.slice(0, displayed.length - 1));
        if (displayed.length === 0) {
          setIsDeleting(false);
          setCurrentWord((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentWord, words]);

  return (
    <span className={className}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-0.5 h-[1em] bg-[#6b5fff] ml-1 align-baseline"
      />
    </span>
  );
}
