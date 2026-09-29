import { pricingSortOptions } from '../pricing.constants'
import SearchField from '../../../../components/SearchField/SearchField'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseSelect from '../../../../components/ui/BaseSelect'

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
      <BaseSelect
        value={categorySlug}
        onChange={(value) => onCategorySlugChange(value)}
        options={[
          { value: '', label: 'Tất cả nhóm' },
          ...categories.map((category) => ({ value: category.slug, label: category.name }))
        ]}
        placeholder="Tất cả nhóm"
      />
      <BaseSelect
        value={sort}
        onChange={(value) => onSortChange(value)}
        options={pricingSortOptions.map((option) => ({
          value: option.value,
          label: option.label
        }))}
        placeholder="Sắp xếp theo"
      />
      <label className="inline-check">
        <BaseInput
          type="checkbox"
          checked={featuredOnly}
          onChange={(event) => onFeaturedOnlyChange(event.target.checked)}
        />
        <span>Chỉ nổi bật</span>
      </label>
    </div>
  )
}

export default PricingFilterBar