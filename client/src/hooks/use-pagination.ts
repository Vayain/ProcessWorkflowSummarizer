import { useState, useMemo, useCallback } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems: number;
}

interface PaginationResult {
  // Current state
  currentPage: number;
  pageSize: number;
  totalPages: number;
  
  // Calculated values
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Navigation methods
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  
  // Utility functions
  getVisiblePages: (maxVisible?: number) => number[];
  paginatedData: <T>(data: T[]) => T[];
}

/**
 * Custom hook for pagination functionality
 * 
 * @param options Configuration options
 * @returns Pagination state and functions
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0
}: PaginationOptions): PaginationResult {
  // State for current page and page size
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);
  
  // Ensure current page is valid when dependencies change
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Navigation methods
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);
  
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);
  
  const changePageSize = useCallback((newSize: number) => {
    // Calculate the first item's index to maintain position
    const firstItemIndex = (currentPage - 1) * pageSize;
    const newPage = Math.floor(firstItemIndex / newSize) + 1;
    
    setPageSize(newSize);
    setCurrentPage(newPage);
  }, [currentPage, pageSize]);
  
  // Calculate start and end indices
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);
  
  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, totalItems - 1);
  }, [startIndex, pageSize, totalItems]);
  
  // Status flags
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  // Function to get visible page numbers for pagination controls
  const getVisiblePages = useCallback((maxVisible: number = 5) => {
    if (totalPages <= maxVisible) {
      // If total pages is less than max visible, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate visible page range
    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisible - 1, totalPages);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }
    
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [currentPage, totalPages]);
  
  // Function to paginate an array of data
  const paginatedData = useCallback(<T>(data: T[]): T[] => {
    return data.slice(startIndex, endIndex + 1);
  }, [startIndex, endIndex]);
  
  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: changePageSize,
    getVisiblePages,
    paginatedData
  };
}

export default usePagination;