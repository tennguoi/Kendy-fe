import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

function range(start, end) {
  const length = end - start + 1
  return Array.from({ length }, (_, i) => start + i)
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) {
  if (totalPages <= 1) return null

  const totalPageNumbers = siblingCount * 2 + 5

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  let pages = []

  if (totalPageNumbers >= totalPages) {
    pages = range(1, totalPages)
  } else {
    if (!showLeftEllipsis && showRightEllipsis) {
      const leftRange = range(1, 3 + siblingCount * 2)
      pages = [...leftRange, '...', totalPages]
    } else if (showLeftEllipsis && !showRightEllipsis) {
      const rightRange = range(totalPages - (3 + siblingCount * 2) + 1, totalPages)
      pages = [1, '...', ...rightRange]
    } else {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      pages = [1, '...', ...middleRange, '...', totalPages]
    }
  }

  return (
    <nav className="pagination" role="navigation" aria-label="Phân trang">
      <button
        type="button"
        className="pagination-btn prev-next"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        <span>Trang trước</span>
      </button>

      <div className="pagination-pages">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            )
          }
          return (
            <button
              key={page}
              type="button"
              className={`pagination-btn page-num ${currentPage === page ? 'active' : ''}`}
              disabled={currentPage === page}
              onClick={() => onPageChange(page)}
              aria-label={`Trang ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="pagination-btn prev-next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Trang sau"
      >
        <span>Trang sau</span>
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </nav>
  )
}

export default Pagination
