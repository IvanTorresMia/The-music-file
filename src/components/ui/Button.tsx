// components/Button.tsx
'use client';

import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Controls the visual style of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses =
    variant === 'primary'
      ? 'bg-primary text-white hover:bg-primary-600 focus:ring-primary-300'
      : variant === 'secondary'
      ? 'bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary-300'
      : 'bg-danger text-white hover:opacity-90 focus:ring-danger';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
