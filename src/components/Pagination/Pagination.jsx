import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  const totalPageNumbers = siblingCount * 2 + 5

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  const pages = (() => {
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages)
    }
    if (!showLeftEllipsis && showRightEllipsis) {
      const leftRange = range(1, 3 + siblingCount * 2)
      return [...leftRange, '...', totalPages]
    }
    if (showLeftEllipsis && !showRightEllipsis) {
      const rightRange = range(totalPages - (3 + siblingCount * 2) + 1, totalPages)
      return [1, '...', ...rightRange]
    }
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    return [1, '...', ...middleRange, '...', totalPages]
  })()

  return (
    <nav className="pagination" role="navigation" aria-label={t('common.pagination', { defaultValue: 'Phân trang' })}>
      <button
        type="button"
        className="pagination-btn prev-next"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={t('common.prevPage', { defaultValue: 'Trang trước' })}
      >
        <ChevronLeft size={16} strokeWidth={2} />
        <span>{t('common.prevPage', { defaultValue: 'Trang trước' })}</span>
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
              aria-label={t('common.pageNumber', { page, defaultValue: 'Trang {{page}}' })}
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
        aria-label={t('common.nextPage', { defaultValue: 'Trang sau' })}
      >
        <span>{t('common.nextPage', { defaultValue: 'Trang sau' })}</span>
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </nav>
  )
}

export default Pagination
