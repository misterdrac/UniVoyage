import { useState, useEffect, useMemo } from 'react';

/**
 * Paginates items with "load more" functionality
 */
export const usePaginatedItems = <T>(
  items: T[],
  initialPageSize = 6,
  pageSizeIncrement = 6
) => {
  const [displayCount, setDisplayCount] = useState(initialPageSize);

  // Reset display count when items change
  useEffect(() => {
    setDisplayCount(initialPageSize);
  }, [items.length, initialPageSize]);

  const displayedItems = useMemo(
    () => items.slice(0, displayCount),
    [items, displayCount]
  );

  const hasMore = items.length > displayCount;

  const loadMore = () => {
    setDisplayCount(prev => prev + pageSizeIncrement);
  };

  return {
    displayedItems,
    hasMore,
    loadMore,
  };
};

