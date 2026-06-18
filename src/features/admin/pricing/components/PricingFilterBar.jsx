import { pricingSortOptions } from '../pricing.constants'
import SearchField from '../../../../components/SearchField/SearchField'

function PricingFilterBar({
  categories = [],
  categorySlug,
  featuredOnly,
  onCategorySlugChange,
  onFeaturedOnlyChange,
  onQueryChange,
  onSortChange,
  query,
  sort,
}) {
  return (
    <div className="admin-filters pricing-filters">
      <SearchField value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm gói dịch vụ" />
      <select value={categorySlug} onChange={(event) => onCategorySlugChange(event.target.value)}>
        <option value="">Tất cả nhóm</option>
        {categories.map((category) => (
          <option value={category.slug} key={category.id}>{category.name}</option>
        ))}
      </select>
      <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
        {pricingSortOptions.map((option) => (
          <option value={option.value} key={option.value}>{option.label}</option>
        ))}
      </select>
      <label className="inline-check">
        <input checked={featuredOnly} onChange={(event) => onFeaturedOnlyChange(event.target.checked)} type="checkbox" />
        <span>Chỉ nổi bật</span>
      </label>
    </div>
  )
}

export default PricingFilterBar
