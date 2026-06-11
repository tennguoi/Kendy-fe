function CatalogToolbar({ count }) {
  return (
    <div className="catalog-toolbar">
      <div>
        <span className="eyebrow">Catalog</span>
        <h2>Dịch vụ Kendy Digital</h2>
      </div>
      <div className="catalog-summary">
        <strong>{count}</strong>
        <span>dịch vụ hiển thị</span>
      </div>
    </div>
  )
}

export default CatalogToolbar
