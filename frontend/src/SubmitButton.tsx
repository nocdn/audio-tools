import { motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface SubmitButtonProps {
  onClick: () => void;
  enabled: boolean;
}

export default function SubmitButton({
  onClick,
  enabled = false,
  ...props
}: SubmitButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      className={`font-jetbrains-mono text-sm w-fit border border-gray-200 hover:bg-gray-50 ${
        enabled ? "cursor-pointer" : "cursor-not-allowed"
      } px-3 py-2 font-medium ${
        enabled ? "text-black" : "text-gray-500"
      } transition-colors inline-flex items-center gap-1`}
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
        overflow: "scroll", // Helps contain content during animation
      }}
      // --- Optional: Add interaction feedback ---
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      // --- Event handling ---
      onMouseEnter={() => {
        if (enabled) {
          setIsHovering(true);
        }
      }}
      onMouseDown={() => {
        if (enabled) {
          onClick();
        }
      }}
      onMouseLeave={() => {
        if (enabled) {
          setIsHovering(false);
        }
      }}
      {...props}
    >
      <>
        SUBMIT{" "}
        {isHovering ? (
          <ArrowUpRight size={16} className="animate-arrow-in" />
        ) : (
          ""
        )}
      </>
    </motion.div>
  );
}
