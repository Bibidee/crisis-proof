import { cn } from "./cn";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, label, options, placeholder, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-mono text-muted-text uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-deep-slate border border-border-steel rounded px-3 py-2 text-sm text-cold-white font-inter focus:outline-none focus:border-legal-blue/60 focus:ring-1 focus:ring-legal-blue/30 transition-colors appearance-none",
            error && "border-redline/60",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-redline font-mono">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
