import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badge
}) => {
  return (
    <div className={title ? 'mb-8' : 'mb-4'}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-slate-500 ${title ? 'mb-2.5' : ''}`}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <ChevronRight size={13} className="text-slate-400" />}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-slate-900 font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {(title || actions || badge || description) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {(title || badge || description) ? (
            <div>
              {title && (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
                    {title}
                  </h1>
                  {badge && <div>{badge}</div>}
                </div>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-600 font-normal">
                  {description}
                </p>
              )}
            </div>
          ) : (
            <div />
          )}

          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
