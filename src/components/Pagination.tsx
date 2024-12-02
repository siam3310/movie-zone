import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showCount?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showCount = false,
  totalItems = 0,
  itemsPerPage = 0
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Show only 5 page numbers at a time
  let pageNumbers = pages;
  if (totalPages > 5) {
    if (currentPage <= 3) {
      pageNumbers = [...pages.slice(0, 5), -1, totalPages];
    } else if (currentPage >= totalPages - 2) {
      pageNumbers = [1, -1, ...pages.slice(totalPages - 5)];
    } else {
      pageNumbers = [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
    }
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded-full ${
            currentPage === 1 
              ? 'text-white/30 cursor-not-allowed' 
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          ←
        </button>
        
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === -1 ? (
              <span className="text-white/30">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  currentPage === page
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded-full ${
            currentPage === totalPages
              ? 'text-white/30 cursor-not-allowed'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          →
        </button>
      </div>

      {showCount && totalItems > 0 && (
        <div className="text-center text-sm text-white/50">
          Showing {startIndex + 1}-{endIndex} of {totalItems} results
        </div>
      )}
    </div>
  );
};

export default Pagination;
