import { motion } from "motion/react";
import { useState } from "react";

interface SettingsProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export default function Settings({
  children,
  onClick,
  className,
  ...props
}: SettingsProps) {
  return (
    <motion.div
      className={`rounded-none text-sm ${className}`}
      // --- Core animation properties ---
      layout // THIS IS THE KEY! Enables automatic size/position animation
      transition={{
        // Optional: customize the animation (spring is nice for this)
        type: "spring",
        stiffness: 500,
        damping: 30,
        // Or a simple ease: duration: 0.2, ease: "easeInOut"
      }}
      // --- Basic button styling ---
      style={{
        cursor: "pointer",
        overflow: "scroll", // Helps contain content during animation
      }}
      // --- Optional: Add interaction feedback ---
      // --- Event handling ---
      onClick={() => {
        onClick();
      }}
      {...props}
    >
      <div>{children}</div>
    </motion.div>
  );
}
