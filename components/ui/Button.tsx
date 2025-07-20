
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = "rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary',
    secondary: 'bg-brand-secondary text-brand-background hover:bg-opacity-80 focus:ring-brand-secondary',
    ghost: 'bg-transparent text-brand-text-muted hover:bg-brand-subtle hover:text-brand-text focus:ring-brand-primary',
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
