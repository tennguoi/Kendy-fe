import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

function ServiceTableSection({ filters, rows, onActionClick }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMode, setSortMode] = useState('popular')

  const visibleRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return rows
      .filter((row) => activeFilter === 'all' || row.category === activeFilter)
      .filter((row) => !keyword || row.name.toLowerCase().includes(keyword) || row.categoryLabel.toLowerCase().includes(keyword))
      .sort((a, b) => {
        if (sortMode === 'category') {
          return a.categoryLabel.localeCompare(b.categoryLabel, 'vi')
        }

        if (sortMode === 'time') {
          return a.processingTime.localeCompare(b.processingTime, 'vi')
        }

        return 0
      })
  }, [activeFilter, rows, searchTerm, sortMode])

  return (
    <section className="public-section service-table-section" id="service-list">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Danh sách dịch vụ</span>
          <h2>Tìm nhanh gói phù hợp trước khi đăng nhập mua hoặc gửi tư vấn</h2>
        </div>
        <p>
          Khi danh mục tăng lên, khách có thể lọc theo CapCut, Facebook, nâng cấp hoặc quảng cáo mà không phải đọc từng
          card dài.
        </p>
      </div>

      <div className="service-toolbar">
        <label className="service-search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            type="search"
            placeholder="Tìm CapCut, Facebook, quảng cáo..."
          />
        </label>

        <select value={sortMode} onChange={(event) => setSortMode(event.target.value)} aria-label="Sắp xếp dịch vụ">
          <option value="popular">Sắp xếp mặc định</option>
          <option value="category">Theo nhóm</option>
          <option value="time">Theo thời gian xử lý</option>
        </select>
      </div>

      <div className="service-filter-row" aria-label="Lọc nhóm dịch vụ">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeFilter === item.id ? 'active' : ''}
            onClick={() => setActiveFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="service-table" role="table" aria-label="Bảng dịch vụ">
        <div className="service-table-head" role="row">
          <span>Dịch vụ</span>
          <span>Nhóm</span>
          <span>Giá từ</span>
          <span>Thời gian</span>
          <span>Bảo hành</span>
          <span>Hành động</span>
        </div>

        {visibleRows.map((row) => {
          const Icon = row.icon

          return (
            <article className="service-row" key={row.name} role="row">
              <div className="service-name-cell">
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
                <strong>{row.name}</strong>
              </div>
              <span>{row.categoryLabel}</span>
              <span>{row.price}</span>
              <span>{row.processingTime}</span>
              <span>{row.warranty}</span>
              <button type="button" onClick={onActionClick}>
                {row.cta}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ServiceTableSection
