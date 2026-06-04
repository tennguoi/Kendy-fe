function AdminOverviewView({ categories, pricingItems, services }) {
  const activeServices = services.filter((service) => service.status === 'ACTIVE').length
  const featuredServices = pricingItems.filter((service) => service.featured).length
  const consultingOnly = pricingItems.filter((service) => service.stockStatus === 'CONSULTING_ONLY').length

  return (
    <section className="admin-view">
      <div className="admin-metrics">
        <article className="admin-metric">
          <span>Dịch vụ đang bật</span>
          <strong>{activeServices}</strong>
        </article>
        <article className="admin-metric">
          <span>Nhóm dịch vụ</span>
          <strong>{categories.length}</strong>
        </article>
        <article className="admin-metric">
          <span>Gói nổi bật</span>
          <strong>{featuredServices}</strong>
        </article>
        <article className="admin-metric">
          <span>Cần tư vấn</span>
          <strong>{consultingOnly}</strong>
        </article>
      </div>

      <div className="admin-empty-panel">
        <span className="eyebrow">Admin</span>
        <h2>Quản lý nội dung public site từ dịch vụ và bảng giá</h2>
        <p>
          Màn hình Dịch vụ quản lý danh mục, mô tả, điều kiện và trạng thái. Màn hình Bảng giá quản lý cách gói dịch vụ
          hiển thị trên public site: giá, badge, CTA, còn hàng hay cần tư vấn.
        </p>
      </div>
    </section>
  )
}

export default AdminOverviewView
