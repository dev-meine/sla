import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-slate-200">
      {icon && (
        <div className="w-14 h-14 mb-4 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default AdminEmptyState;
