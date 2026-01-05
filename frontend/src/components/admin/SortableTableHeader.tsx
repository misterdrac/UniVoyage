import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableTableHeaderProps<T extends string> {
  field: T;
  label: string;
  currentSortField: T;
  sortDirection: 'asc' | 'desc';
  isUsingDefaultSort: boolean;
  onSort: (field: T) => void;
  className?: string;
}

export function SortableTableHeader<T extends string>({
  field,
  label,
  currentSortField,
  sortDirection,
  isUsingDefaultSort,
  onSort,
  className = 'px-4 py-3',
}: SortableTableHeaderProps<T>) {
  const isActive = currentSortField === field && !isUsingDefaultSort;

  return (
    <th
      className={`text-center text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        <span className="inline-flex items-center justify-center w-4 h-4">
          {isActive ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )
          ) : (
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground/50" />
          )}
        </span>
      </div>
    </th>
  );
}

