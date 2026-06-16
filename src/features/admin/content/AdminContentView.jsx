import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../../api/admin.api';
import { AdminEmptyState, AdminStatusBadge } from '../AdminShared';
import { formatAdminDate } from '../adminFormat';

const emptyDraft = {
  content: '',
  ctaUrl: '',
  imageUrl: '',
  published: false,
  seoDescription: '',
  seoTitle: '',
  slug: '',
  sortOrder: 0,
  summary: '',
  title: '',
  type: 'BLOG',
};

function AdminContentView({ onSetError, onSetNotice, token }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  const loadContent = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    onSetError('');
    try {
      setItems(await adminApi.listContent({ query: query.trim(), type: typeFilter || undefined }, token));
    } catch (err) {
      onSetError(err.message || 'Không tải được nội dung.');
    } finally {
      setLoading(false);
    }
  }, [onSetError, query, token, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(loadContent, 200);
    return () => window.clearTimeout(timer);
  }, [loadContent]);

  const selectItem = (item) => {
    setSelectedId(item.id);
    setDraft({
      content: item.content || '',
      ctaUrl: item.ctaUrl || '',
      imageUrl: item.imageUrl || '',
      published: Boolean(item.published),
      seoDescription: item.seoDescription || '',
      seoTitle: item.seoTitle || '',
      slug: item.slug || '',
      sortOrder: item.sortOrder || 0,
      summary: item.summary || '',
      title: item.title || '',
      type: item.type || 'BLOG',
    });
  };

  const resetDraft = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
  };

  const saveContent = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    onSetError('');
    try {
      const payload = { ...draft, sortOrder: Number(draft.sortOrder) || 0 };
      const saved = selectedId
        ? await adminApi.updateContent(selectedId, payload, token)
        : await adminApi.createContent(payload, token);
      setSelectedId(saved.id);
      setDraft((current) => ({ ...current, slug: saved.slug }));
      await loadContent();
      onSetNotice(`Đã lưu nội dung ${saved.title}.`);
    } catch (err) {
      onSetError(err.message || 'Không lưu được nội dung.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteContent = async (id) => {
    setSubmitting(true);
    onSetError('');
    try {
      await adminApi.deleteContent(id, token);
      if (selectedId === id) {
        resetDraft();
      }
      await loadContent();
      onSetNotice(`Đã xoá nội dung #${id}.`);
    } catch (err) {
      onSetError(err.message || 'Không xoá được nội dung.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <h2>Nội dung & SEO</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadContent} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      <div className="admin-grid two-columns">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>{selectedId ? `Sửa #${selectedId}` : 'Tạo nội dung'}</h3>
            <button type="button" className="admin-icon-button slim" onClick={resetDraft}>
              <Plus size={15} strokeWidth={2} aria-hidden="true" />
              <span>Mới</span>
            </button>
          </div>
          <form className="admin-form compact" onSubmit={saveContent}>
            <label>
              <span>Loại nội dung</span>
              <select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}>
                <option value="BLOG">Blog / Tin tức</option>
                <option value="STATIC_PAGE">Trang tĩnh</option>
                <option value="BANNER">Banner / Slideshow</option>
              </select>
            </label>
            <label>
              <span>Tiêu đề</span>
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required />
            </label>
            <label>
              <span>Slug</span>
              <input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} required />
            </label>
            <label>
              <span>Tóm tắt</span>
              <textarea value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} rows={3} />
            </label>
            <label>
              <span>Nội dung</span>
              <textarea value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} rows={8} />
            </label>
            <label>
              <span>Ảnh / banner URL</span>
              <input value={draft.imageUrl} onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))} />
            </label>
            <label>
              <span>CTA URL</span>
              <input value={draft.ctaUrl} onChange={(event) => setDraft((current) => ({ ...current, ctaUrl: event.target.value }))} />
            </label>
            <div className="admin-form-grid two-columns">
              <label>
                <span>SEO title</span>
                <input value={draft.seoTitle} onChange={(event) => setDraft((current) => ({ ...current, seoTitle: event.target.value }))} />
              </label>
              <label>
                <span>Thứ tự</span>
                <input type="number" value={draft.sortOrder} onChange={(event) => setDraft((current) => ({ ...current, sortOrder: event.target.value }))} />
              </label>
            </div>
            <label>
              <span>SEO description</span>
              <textarea value={draft.seoDescription} onChange={(event) => setDraft((current) => ({ ...current, seoDescription: event.target.value }))} rows={2} />
            </label>
            <label className="admin-check-row">
              <input type="checkbox" checked={draft.published} onChange={(event) => setDraft((current) => ({ ...current, published: event.target.checked }))} />
              <span>Xuất bản</span>
            </label>
            <button type="submit" disabled={submitting}>
              {selectedId ? <Edit3 size={16} strokeWidth={2} aria-hidden="true" /> : <Plus size={16} strokeWidth={2} aria-hidden="true" />}
              <span>{selectedId ? 'Lưu thay đổi' : 'Tạo nội dung'}</span>
            </button>
          </form>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh sách nội dung</h3>
            <span>{items.length} mục</span>
          </div>
          <div className="admin-filters">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tiêu đề, slug..." />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="">Tất cả</option>
              <option value="BLOG">Blog</option>
              <option value="STATIC_PAGE">Trang tĩnh</option>
              <option value="BANNER">Banner</option>
            </select>
          </div>
          <div className="admin-mini-list">
            {items.map((item) => (
              <article key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.type} · /{item.slug} · {formatAdminDate(item.updatedAt || item.createdAt)}</span>
                <AdminStatusBadge status={item.published ? 'PUBLISHED' : 'DRAFT'} />
                <div className="admin-action-row">
                  <button type="button" className="admin-icon-button slim" onClick={() => selectItem(item)}>
                    <Edit3 size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Sửa</span>
                  </button>
                  <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => deleteContent(item.id)}>
                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Xoá</span>
                  </button>
                </div>
              </article>
            ))}
            {items.length === 0 && <AdminEmptyState message={loading ? 'Đang tải nội dung...' : 'Chưa có nội dung.'} />}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminContentView;
