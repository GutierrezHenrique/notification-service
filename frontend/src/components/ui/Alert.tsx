import { ReactNode } from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

export const Alert = ({
  type = 'info',
  children,
  className = '',
}: AlertProps) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div
      className={`border rounded px-4 py-3 ${styles[type]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
};
