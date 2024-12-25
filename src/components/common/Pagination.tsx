import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  // Calculate real total pages
  const calculatedPages = Math.ceil(totalItems / itemsPerPage);
  const totalPages = calculatedPages > 0 ? calculatedPages : 1;
  
  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) return null;

  // Ensure current page is within bounds
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  if (safePage !== currentPage) {
    onPageChange(safePage);
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;
    
    if (showEllipsis) {
      if (currentPage <= 4) {
        // Show first 5 pages + ellipsis + last page
        for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i);
        if (totalPages > 5) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        // Show first page + ellipsis + last 5 pages
        pages.push(1);
        if (totalPages > 5) {
          pages.push('...');
          for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= Math.min(currentPage + 1, totalPages); i++) {
          pages.push(i);
        }
        if (currentPage + 1 < totalPages) {
          pages.push('...');
          pages.push(totalPages);
        }
      }
    } else {
      // Show all pages when total pages is small
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          currentPage === 1
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={page === '...'}
          className={`min-w-[1.75rem] h-7 px-1 rounded text-xs font-medium transition-colors ${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : page === '...'
              ? 'text-gray-500 cursor-default'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          currentPage === totalPages
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
