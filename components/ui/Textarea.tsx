import { cn } from "./cn";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-mono text-muted-text uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-deep-slate border border-border-steel rounded px-3 py-2 text-sm text-cold-white font-inter placeholder:text-muted-text/50 focus:outline-none focus:border-legal-blue/60 focus:ring-1 focus:ring-legal-blue/30 transition-colors resize-none",
            error && "border-redline/60 focus:border-redline focus:ring-redline/30",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-redline font-mono">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
