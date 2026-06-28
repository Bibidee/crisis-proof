import { cn } from "./cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "redline" | "ghost" | "outline" | "amber";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-legal-blue hover:bg-legal-blue/80 text-white border-legal-blue/50",
  redline: "bg-redline hover:bg-redline/80 text-white border-redline/50",
  ghost: "bg-transparent hover:bg-deep-slate text-muted-text border-transparent",
  outline: "bg-transparent hover:bg-deep-slate text-cold-white border-border-steel",
  amber: "bg-emergency-amber hover:bg-emergency-amber/80 text-crisis-black border-emergency-amber/50",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "outline", size = "md", loading, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center gap-2 rounded border font-inter font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-redline/40 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
