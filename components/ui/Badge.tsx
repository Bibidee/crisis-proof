import { cn } from "./cn";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "redline" | "amber" | "green" | "blue" | "slate";
}

const variants = {
  default: "bg-border-steel/20 text-muted-text border-border-steel/30",
  redline: "bg-redline/20 text-redline border-redline/30",
  amber: "bg-emergency-amber/20 text-emergency-amber border-emergency-amber/30",
  green: "bg-trust-green/20 text-trust-green border-trust-green/30",
  blue: "bg-legal-blue/20 text-legal-blue border-legal-blue/30",
  slate: "bg-deep-slate/60 text-cold-white border-border-steel/30",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
