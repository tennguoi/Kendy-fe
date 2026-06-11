import { AdminEmptyState } from '../../AdminShared'

function PricingListPanel({
  onSelectItem,
  pricingItems = [],
  selectedItem,
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Bảng giá</h3>
        <span>{pricingItems.length} gói</span>
      </div>
      <div className="admin-pricing-table">
        <div className="admin-pricing-row head">
          <span>Dịch vụ</span>
          <span>Giá</span>
          <span>CTA</span>
          <span>Trạng thái</span>
        </div>
        {pricingItems.map((item) => (
          <button
            type="button"
            className={`admin-pricing-row ${selectedItem?.id === item.id ? 'selected' : ''}`}
            key={item.id}
            onClick={() => onSelectItem(item)}
          >
            <span>
              <strong>{item.name}</strong>
              <small>{item.categoryName || 'Chưa phân nhóm'} · {item.pricingBadge || 'Không badge'}</small>
            </span>
            <span>{item.priceText || item.price}</span>
            <span>{item.ctaType}</span>
            <span>{item.stockStatus}</span>
          </button>
        ))}
        {pricingItems.length === 0 && <AdminEmptyState />}
      </div>
    </div>
  )
}

export default PricingListPanel
