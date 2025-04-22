import { motion } from "motion/react";
import { useState } from "react";

interface DropZoneProps {
  children: React.ReactNode;
  onClick: () => void;
  onDropped: (file: File) => void;
  className?: string;
}

export default function DropZone({
  children,
  onClick,
  onDropped,
  className,
  ...props
}: DropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  return (
    <motion.div
      className={`px-2.5 py-1 border-none rounded-none text-sm ${className}`}
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
        outline: isDraggingOver ? `1px dashed blue` : `1px dashed lightgray`,
      }}
      // --- Optional: Add interaction feedback ---
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      // --- Event handling ---
      onClick={() => {
        onClick();
      }}
      onDragOver={(event) => {
        // Add this handler
        event.preventDefault(); // Prevent default behavior to allow dropping
        setIsDraggingOver(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDraggingOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault(); // Prevent default file opening behavior
        const droppedFile = event.dataTransfer.files[0];
        setIsDraggingOver(false);
        onDropped(droppedFile);
      }}
      {...props}
    >
      <div>{children}</div>
    </motion.div>
  );
}
