import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-lg border ${
              error
                ? 'border-tjpa-red focus:ring-tjpa-red/20 focus:border-tjpa-red'
                : 'border-slate-300 focus:ring-tjpa-navy/20 focus:border-tjpa-navy'
            } bg-white px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-4 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-xs text-tjpa-red font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
