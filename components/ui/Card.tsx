import React from 'react';

// Extend the props to include all standard div attributes like onClick
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-brand-surface rounded-lg border border-brand-subtle shadow-lg p-6 transition-all duration-300 hover:shadow-brand-primary/20 hover:-translate-y-1 ${className}`}
      {...props} // Spread the rest of the props here
    >
      {children}
    </div>
  );
};

export default Card;
