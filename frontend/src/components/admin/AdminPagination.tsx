import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentCount: number;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentCount,
  totalCount,
  page,
  totalPages,
  onPageChange,
  itemLabel = 'items',
}) => {
  return (
    <div className="p-4 border-t bg-muted/30 flex items-center justify-between flex-shrink-0">
      <p className="text-sm text-muted-foreground">
        Showing {currentCount} of {totalCount} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          Page {page + 1} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

