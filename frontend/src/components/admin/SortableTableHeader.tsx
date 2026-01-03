import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { SortDirection } from '@/hooks/useAdminTable';

interface SortableTableHeaderProps<T extends string> {
  field: T;
  label: string;
  currentSortField: T;
  sortDirection: SortDirection;
  onSort: (field: T) => void;
  className?: string;
}

export function SortableTableHeader<T extends string>({
  field,
  label,
  currentSortField,
  sortDirection,
  onSort,
  className = 'px-4 py-3',
}: SortableTableHeaderProps<T>) {
  const isActive = currentSortField === field;

  return (
    <th
      className={`text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        )}
      </div>
    </th>
  );
}

