import { useState, useCallback } from 'react'
import { useToast } from '../Toast'
import Button from '../Button/Button'
import Loading from '../Loading/Loading'
import Pagination from '../Pagination/Pagination'
import SearchField from '../SearchField/SearchField'
import Modal from '../Modal/Modal'
import ScrollReveal from '../ScrollReveal/ScrollReveal'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import './DevPlayground.css'

export default function DevPlayground() {
  const { addToast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const showToast = useCallback((type) => {
    const labels = { info: 'Thông báo', success: 'Thành công', error: 'Lỗi' }
    const messages = {
      info: 'Đây là thông báo dạng info. Click vào để xem chi tiết.',
      success: 'Thao tác đã hoàn tất thành công!',
      error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
    }
    addToast({
      type,
      title: labels[type],
      message: messages[type],
      action: type === 'info' ? '/orders' : type === 'success' ? '/deposit' : undefined,
      timeout: 5000,
    })
  }, [addToast])

  if (showLoading) {
    return (
      <div className="playground">
        <Loading fullScreen={false} message="Đang tải dữ liệu..." />
        <br />
        <Button variant="outline" onClick={() => setShowLoading(false)}>
          Tắt Loading
        </Button>
      </div>
    )
  }

  return (
    <div className="playground">
      <h1>Component Playground</h1>
      <p className="sub">Kiểm tra trực quan các UI components</p>

      <section className="playground-section">
        <h2>Toast</h2>
        <div className="playground-row">
          <button className="playground-trigger-btn" onClick={() => showToast('info')}>
            Toast Info
          </button>
          <button className="playground-trigger-btn success" onClick={() => showToast('success')}>
            Toast Success
          </button>
          <button className="playground-trigger-btn error" onClick={() => showToast('error')}>
            Toast Error
          </button>
        </div>
      </section>

      <section className="playground-section">
        <h2>Button</h2>
        <div className="playground-row">
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="glass">Glass</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="">Default</Button>
        </div>
      </section>

      <section className="playground-section">
        <h2>Loading</h2>
        <div className="playground-row">
          <Button variant="outline" onClick={() => setShowLoading(true)}>
            Bật Loading inline
          </Button>
          <Loading fullScreen={false} message="Đang xử lý..." />
        </div>
      </section>

      <section className="playground-section">
        <h2>Pagination</h2>
        <Pagination
          currentPage={page}
          totalPages={20}
          onPageChange={setPage}
        />
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 8 }}>Current: {page}</p>
      </section>

      <section className="playground-section">
        <h2>SearchField</h2>
        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Tìm kiếm..."
        />
      </section>

      <section className="playground-section">
        <h2>Modal</h2>
        <div className="playground-row">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Mở Modal
          </Button>
        </div>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal Demo"
        >
          <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            Đây là nội dung bên trong modal. Nhấn ESC hoặc click ra ngoài để đóng.
          </p>
          <div style={{ marginTop: 16 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </Modal>
      </section>

      <section className="playground-section">
        <h2>ScrollReveal</h2>
        <div className="playground-row column">
          {[1, 2, 3].map((i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="playground-card">
                <p>ScrollReveal Item #{i} — scroll để thấy hiệu ứng</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="playground-section">
        <h2>LanguageSwitcher</h2>
        <LanguageSwitcher />
      </section>
    </div>
  )
}
