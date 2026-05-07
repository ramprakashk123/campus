import { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ value, duration = 1500, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

  useEffect(() => {
    if (isNaN(numericValue)) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const end = numericValue;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [numericValue, duration]);

  return (
    <span>{prefix}{displayValue}{suffix}</span>
  );
};

export default AnimatedCounter;
