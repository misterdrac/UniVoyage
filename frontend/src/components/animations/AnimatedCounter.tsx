import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ end, duration = 2000, suffix = '', className = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const hasAnimatedRef = useRef(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // If already animated, just set the final count and don't observe
    if (hasAnimatedRef.current) {
      setCount(end);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          
          // Disconnect observer immediately after animation starts
          if (observerRef.current && counterRef.current) {
            observerRef.current.unobserve(counterRef.current);
          }
          
          const startTime = Date.now();
          const startValue = 0;
          
          const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart);
            
            setCount(currentCount);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current && observerRef.current) {
      observerRef.current.observe(counterRef.current);
    }

    return () => {
      if (observerRef.current && counterRef.current) {
        observerRef.current.unobserve(counterRef.current);
      }
    };
  }, [end, duration]);

  return (
    <span ref={counterRef} className={className}>
      {count}{suffix}
    </span>
  );
}

