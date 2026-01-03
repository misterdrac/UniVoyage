import React from 'react';
import { Loader2 } from 'lucide-react';

interface AdminLoadingStateProps {
  colSpan: number;
  message?: string;
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  colSpan,
  message = 'Loading...',
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">{message}</p>
      </td>
    </tr>
  );
};

interface AdminEmptyStateProps {
  colSpan: number;
  message?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  colSpan,
  message = 'No items found',
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  );
};

interface AdminEmptySelectionProps {
  icon: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}

export const AdminEmptySelection: React.FC<AdminEmptySelectionProps> = ({
  icon,
  message,
  action,
}) => {
  return (
    <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action}
    </div>
  );
};

