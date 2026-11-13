import { type ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-100 text-dark-400">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-dark-700">{title}</p>
        {description && <p className="mt-1 text-sm text-dark-400">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
