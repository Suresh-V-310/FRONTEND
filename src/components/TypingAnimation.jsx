import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TYPING_WORDS } from '../utils/constants';

/**
 * Typing animation component for hero section
 */
const TypingAnimation = ({ className = '' }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = TYPING_WORDS[wordIndex];
    const speed = isDeleting ? 50 : 100;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
        if (displayText.length === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <span className={`gradient-text font-bold ${className}`}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-[3px] h-[1em] bg-accent-cyan ml-1 align-middle"
      />
    </span>
  );
};

export default TypingAnimation;
