import { useState, useEffect } from 'react';

const useSlideText = (texts: string[], delay = 3000): string => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (!texts || texts.length === 0) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, delay);

    return () => clearInterval(interval);
  }, [texts, delay]);

  return texts[currentIndex];
};

export default useSlideText;
