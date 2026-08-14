import React from 'react';

interface BadgeProps {
  variant?: 'navy' | 'gold' | 'green' | 'red' | 'gray';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'navy',
  size = 'md',
  children,
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    navy: 'bg-[#002B5C]/10 text-[#002B5C] border border-[#002B5C]/20',
    gold: 'bg-[#C59B27]/15 text-[#A4801B] border border-[#C59B27]/30',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    red: 'bg-red-50 text-tjpa-red border border-red-200',
    gray: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const dotStyles = {
    navy: 'bg-[#002B5C]',
    gold: 'bg-[#C59B27]',
    green: 'bg-emerald-500',
    red: 'bg-tjpa-red',
    gray: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
};
