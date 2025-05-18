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
      ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300'
      : variant === 'secondary'
      ? 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-200'
      : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
