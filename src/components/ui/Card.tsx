import { type ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-dark-200 bg-white ${onClick ? 'cursor-pointer transition-all hover:border-dark-300 hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
