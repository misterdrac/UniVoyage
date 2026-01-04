import { useState, useCallback } from 'react';

interface UseAdminTableOptions<T extends string> {
  defaultSortField: T;
  defaultSortDirection?: 'asc' | 'desc';
  defaultPageSize?: number;
}

interface UseAdminTableReturn<T extends string> {
  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  // Sorting
  sortField: T;
  sortDirection: 'asc' | 'desc';
  sortString: string;
  isUsingDefaultSort: boolean;
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

  // Sorting state - track if we're using default or custom sort
  const [sortField, setSortField] = useState<T>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [isUsingDefaultSort, setIsUsingDefaultSort] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sort string for API
  const sortString = `${sortField},${sortDirection}`;

  // Handle sort click - three states: asc -> desc -> reset to default -> asc
  const handleSort = useCallback((field: T) => {
    const isActiveField = sortField === field && !isUsingDefaultSort;
    
    if (isActiveField) {
      if (sortDirection === 'asc') {
        // Second click: desc
        setSortDirection('desc');
      } else {
        // Third click: reset to default
        setSortField(defaultSortField);
        setSortDirection(defaultSortDirection);
        setIsUsingDefaultSort(true);
      }
    } else {
      // First click on this field or switching fields: asc
      setSortField(field);
      setSortDirection('asc');
      setIsUsingDefaultSort(field === defaultSortField && 'asc' === defaultSortDirection);
    }
    setPage(0);
  }, [sortField, sortDirection, isUsingDefaultSort, defaultSortField, defaultSortDirection]);

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
    isUsingDefaultSort,
    handleSort,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
  };
}

