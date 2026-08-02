"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/cn";

const SPRING = { stiffness: 200, damping: 15, mass: 0.4 };

const MOTION_TAGS = { button: motion.button, a: motion.a };

/** Bouton qui suit légèrement le curseur au survol — effet signature des sites premium. */
export function MagneticButton({
  children,
  className,
  as = "button",
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: "button" | "a";
  [key: string]: unknown;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const MotionComponent = MOTION_TAGS[as];

  return (
    <MotionComponent
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
