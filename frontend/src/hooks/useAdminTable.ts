import { useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

interface UseAdminTableOptions<T extends string> {
  defaultSortField: T;
  defaultSortDirection?: SortDirection;
  defaultPageSize?: number;
}

interface UseAdminTableReturn<T extends string> {
  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  // Sorting
  sortField: T;
  sortDirection: SortDirection;
  sortString: string;
  handleSort: (field: T) => void;
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchChange: (query: string) => void;
}

/**
 * Custom hook for managing admin table state (pagination, sorting, search)
 */
export function useAdminTable<T extends string>(
  options: UseAdminTableOptions<T>
): UseAdminTableReturn<T> {
  const {
    defaultSortField,
    defaultSortDirection = 'desc',
    defaultPageSize = 10,
  } = options;

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(defaultPageSize);

  // Sorting state
  const [sortField, setSortField] = useState<T>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sort string for API
  const sortString = `${sortField},${sortDirection}`;

  // Handle sort click
  const handleSort = useCallback((field: T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  }, [sortField]);

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  return {
    page,
    pageSize,
    setPage,
    sortField,
    sortDirection,
    sortString,
    handleSort,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
  };
}

