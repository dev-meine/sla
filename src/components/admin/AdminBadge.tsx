import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  withDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-accent-50 text-accent-700 border border-accent-200/70',
    dot: 'bg-accent-500'
  },
  warning: {
    container: 'bg-secondary-50 text-secondary-800 border border-secondary-200/70',
    dot: 'bg-secondary-500'
  },
  info: {
    container: 'bg-primary-50 text-primary-700 border border-primary-200/70',
    dot: 'bg-primary-600'
  },
  danger: {
    container: 'bg-rose-50 text-rose-700 border border-rose-200/70',
    dot: 'bg-rose-500'
  },
  neutral: {
    container: 'bg-slate-100 text-slate-700 border border-slate-200',
    dot: 'bg-slate-400'
  }
};

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'neutral',
  withDot = true,
  size = 'sm',
  className = ''
}) => {
  const styles = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${styles.container} ${sizeClasses} ${className}`}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default AdminBadge;
