import { useEffect } from 'react';

/**
 * Custom hook to set the document title
 * @param title - The title to set (will be appended with " | UniVoyage")
 * @param dependencies - Optional dependencies array for useEffect (for dynamic titles)
 */
export function useDocumentTitle(title: string, dependencies: unknown[] = []) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | UniVoyage` : 'UniVoyage';
    
    return () => {
      document.title = previousTitle;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, ...dependencies]);
}
