import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  className?: string;
  swipeThreshold?: number;
  longPressDelay?: number;
}

const TouchGestures: React.FC<TouchGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  onPinch,
  className = '',
  swipeThreshold = 50,
  longPressDelay = 500
}) => {
  const controls = useAnimation();
  const elementRef = useRef<HTMLDivElement>(null);
  const [lastTap, setLastTap] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [initialDistance, setInitialDistance] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Handle pan gesture
  const handlePan = (_: any, info: PanInfo) => {
    const { offset } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    // Determine swipe direction
    if (absX > swipeThreshold && absX > absY) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absY > swipeThreshold && absY > absX) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset position
    controls.start({ x: 0, y: 0 });
  };

  // Handle touch start
  const handleTouchStart = (event: React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;

    // Long press detection
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
      setLongPressTimer(timer);
    }

    // Double tap detection
    if (onDoubleTap && timeSinceLastTap < 300) {
      onDoubleTap();
    }
    setLastTap(now);

    // Pinch detection
    if (event.touches.length === 2 && onPinch) {
      const distance = getTouchDistance(event.touches as any);
      setInitialDistance(distance);
    }
  };

  // Handle touch move
  const handleTouchMove = (event: React.TouchEvent) => {
    // Clear long press timer on move
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Handle pinch gesture
    if (event.touches.length === 2 && onPinch && initialDistance > 0) {
      const currentDistance = getTouchDistance(event.touches as any);
      const scale = currentDistance / initialDistance;
      
      if (scale !== currentScale) {
        setCurrentScale(scale);
        onPinch(scale);
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = (event: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Reset pinch state
    if (event.touches.length === 0) {
      setInitialDistance(0);
      setCurrentScale(1);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <motion.div
      ref={elementRef}
      className={className}
      animate={controls}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onPanEnd={handlePan}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </motion.div>
  );
};

export default TouchGestures;