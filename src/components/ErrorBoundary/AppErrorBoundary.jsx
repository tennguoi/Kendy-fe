import { AlertTriangle, Home, RefreshCw, RotateCcw } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import './error-boundary.css'

function DefaultErrorFallback({ error, resetErrorBoundary, level = 'page' }) {
  const { t } = useTranslation()
  const isRoot = level === 'root'

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.assign('/')
  }

  return (
    <div className={isRoot ? 'error-fallback-root' : 'error-fallback-page'} role="alert">
      <div className="error-fallback-card">
        <div className="error-fallback-icon" aria-hidden="true">
          <AlertTriangle size={isRoot ? 32 : 26} strokeWidth={2.2} />
        </div>

        <h2 className="error-fallback-title">
          {isRoot
            ? t('errorBoundary.rootTitle', { defaultValue: 'Hệ thống đã gặp sự cố không mong muốn' })
            : t('errorBoundary.pageTitle', { defaultValue: 'Không thể hiển thị nội dung này' })}
        </h2>

        <p className="error-fallback-message">
          {isRoot
            ? t('errorBoundary.rootMessage', {
                defaultValue: 'Ứng dụng đã gặp lỗi hiển thị bất ngờ. Vui lòng thử tải lại trang hoặc quay về trang chủ.',
              })
            : t('errorBoundary.pageMessage', {
                defaultValue: 'Phần giao diện này đã phát sinh lỗi trong quá trình xử lý. Các phần khác của hệ thống vẫn hoạt động bình thường.',
              })}
        </p>

        <div className="error-fallback-actions">
          {resetErrorBoundary && (
            <button type="button" className="error-btn-primary" onClick={resetErrorBoundary}>
              <RotateCcw size={15} />
              <span>{t('errorBoundary.retry', { defaultValue: 'Thử lại' })}</span>
            </button>
          )}

          <button type="button" className="error-btn-secondary" onClick={handleReload}>
            <RefreshCw size={15} />
            <span>{t('errorBoundary.reloadPage', { defaultValue: 'Tải lại trang' })}</span>
          </button>

          {isRoot && (
            <button type="button" className="error-btn-secondary" onClick={handleGoHome}>
              <Home size={15} />
              <span>{t('errorBoundary.goHome', { defaultValue: 'Về trang chủ' })}</span>
            </button>
          )}
        </div>

        {error?.message && (
          <details className="error-details-toggle">
            <summary>{t('errorBoundary.viewTechnicalDetails', { defaultValue: 'Chi tiết kỹ thuật (dành cho lập trình viên)' })}</summary>
            <div className="error-details-content">
              <strong>Error:</strong> {error.toString()}
              {error.stack && (
                <>
                  <br />
                  <br />
                  <strong>Stack trace:</strong>
                  <br />
                  {error.stack}
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * AppErrorBoundary - Reusable Error Boundary powered by `react-error-boundary`.
 *
 * @param {Object} props
 * @param {'root' | 'page' | 'widget'} [props.level='page'] - Hierarchy level of the boundary
 * @param {Function} [props.onError] - Custom error logger callback
 * @param {Function} [props.onReset] - Reset handler
 * @param {React.ReactNode} props.children
 */
export function AppErrorBoundary({ level = 'page', onError, onReset, fallbackRender, children }) {
  const handleError = (error, info) => {
    // Log to console or external monitoring
    console.error(`[AppErrorBoundary:${level}] Caught error:`, error, info)
    onError?.(error, info)
  }

  return (
    <ErrorBoundary
      onError={handleError}
      onReset={onReset}
      fallbackRender={fallbackRender || ((fallbackProps) => (
        <DefaultErrorFallback {...fallbackProps} level={level} />
      ))}
    >
      {children}
    </ErrorBoundary>
  )
}

export default AppErrorBoundary
