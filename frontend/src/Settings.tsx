import { motion } from "motion/react";

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
      layout
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      style={{
        cursor: "pointer",
        overflow: "scroll",
      }}
      onClick={onClick}
      {...props}
    >
      <div>{children}</div>
    </motion.div>
  );
}
