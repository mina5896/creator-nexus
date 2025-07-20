
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-brand-text-muted mb-2">{label}</label>}
      <input
        id={id}
        className="w-full bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
        {...props}
      />
    </div>
  );
};

export default Input;
