import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { formatCategory, formatDate } from '../utils/formatters';
import { deleteContent, fetchContent, saveContent } from '../services/api';

const CATEGORIES = ['cycle_migraine', 'triggers', 'treatment', 'general'];

const emptyItem = {
  title: '',
  category: 'general',
  body: '',
  featured_image_url: '',
  is_published: false,
};

const CATEGORY_BADGE = {
  cycle_migraine: 'bg-wisteria-300 text-wisteria-950',
  triggers: 'bg-cycle-ovulatory/30 text-wisteria-50 border border-cycle-ovulatory/50',
  treatment: 'bg-wisteria-300 text-wisteria-950',
  general: 'bg-wisteria-500/25 text-wisteria-100 border border-wisteria-500/40',
};

const PUBLISH_BADGE = {
  published: 'bg-success/25 text-wisteria-50 border border-success/50',
  draft: 'bg-wisteria-800 text-wisteria-100 border border-wisteria-600',
};

export function EducationalContentPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContent();
      setItems(data || []);
    } catch (err) {
      console.error('FETCH CONTENT ERROR:', err);
      showToast('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.title?.toLowerCase().includes(q) ||
        item.body?.toLowerCase().includes(q) ||
        item.content?.toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter]);

  function openNew() {
    setEditId(null);
    setForm(emptyItem);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      body: item.body || item.content || '',
      featured_image_url: item.featured_image_url || item.featured_image || '',
      is_published: item.is_published,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveContent({ ...form, id: editId || undefined });
      showToast(editId ? 'Content updated' : 'Content created', 'success');
      setModalOpen(false);
      load();
    } catch (err) {
      console.error('SAVE CONTENT ERROR:', err);
      showToast(err.message || 'Failed to save content', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(item) {
    try {
      await saveContent({ ...item, is_published: !item.is_published });
      showToast(item.is_published ? 'Content unpublished' : 'Content published', 'success');
      load();
    } catch (err) {
      console.error('TOGGLE PUBLISH ERROR:', err);
      showToast('Failed to update publish status', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteContent(deleteTarget.id);
      showToast('Content deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      console.error('DELETE CONTENT ERROR:', err);
      showToast('Failed to delete content', 'error');
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="rounded-[24px] bg-surface border border-border p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search by title or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl bg-elevated pl-11 pr-4 font-plein text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 w-full md:w-auto appearance-none rounded-xl bg-elevated pl-4 pr-10 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{formatCategory(c)}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        <button
          onClick={openNew}
          className="h-11 rounded-xl bg-wisteria-300 px-5 font-plein-medium text-sm text-wisteria-950 hover:bg-wisteria-200 transition-colors inline-flex items-center gap-2 shrink-0 shadow-md shadow-wisteria-900/20"
        >
          <Plus size={16} />
          Add New Content
        </button>
      </div>

      {/* Table */}
      <div className="rounded-[24px] bg-wisteria-800 border border-wisteria-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-wisteria-700 bg-wisteria-900/50">
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Title</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Category</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Status</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Created</th>
                <th className="px-6 py-4 text-right font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-plein text-sm text-wisteria-300">
                    Loading content…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-plein text-sm text-wisteria-300">
                    {items.length === 0
                      ? 'No content yet. Click "Add New Content" to create your first article.'
                      : 'No content matches your filters.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-wisteria-700/50 last:border-b-0 hover:bg-wisteria-700/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-plein-medium text-sm text-wisteria-50 max-w-[320px]">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-left hover:text-cycle-luteal transition-colors line-clamp-2"
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={CATEGORY_BADGE[item.category] || 'bg-wisteria-900 text-wisteria-300'}>
                        {formatCategory(item.category)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={item.is_published ? PUBLISH_BADGE.published : PUBLISH_BADGE.draft}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-plein text-sm text-wisteria-200">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(item)}
                          title="Edit"
                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-wisteria-500/20 text-wisteria-200 hover:bg-wisteria-500 hover:text-wisteria-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => togglePublish(item)}
                          title={item.is_published ? 'Unpublish' : 'Publish'}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                            item.is_published
                              ? 'bg-cycle-ovulatory/20 text-cycle-ovulatory hover:bg-cycle-ovulatory hover:text-background'
                              : 'bg-success/20 text-success hover:bg-success hover:text-background'
                          }`}
                        >
                          {item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          title="Delete"
                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-danger/20 text-danger hover:bg-danger hover:text-wisteria-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editId ? 'Edit Content' : 'Add New Content'}
        onClose={() => !saving && setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 font-plein-medium text-sm text-text-secondary">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block mb-2 font-plein-medium text-sm text-text-secondary">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-11 appearance-none rounded-xl bg-elevated pl-4 pr-10 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{formatCategory(c)}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-plein-medium text-sm text-text-secondary">Content body</label>
            <textarea
              rows={8}
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full rounded-xl bg-elevated px-4 py-3 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand resize-vertical"
            />
          </div>

          <div>
            <label className="block mb-2 font-plein-medium text-sm text-text-secondary">Featured Image URL (optional)</label>
            <input
              type="url"
              value={form.featured_image_url}
              onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
              placeholder="https://..."
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-elevated px-4 py-3">
            <div>
              <p className="font-plein-medium text-sm text-text-primary">Published</p>
              <p className="font-plein text-xs text-text-muted mt-0.5">
                {form.is_published ? 'Visible to users in the app' : 'Saved as draft'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_published: !form.is_published })}
              className="relative rounded-full transition-colors"
              style={{
                width: 48,
                height: 28,
                backgroundColor: form.is_published ? '#ad89dc' : '#2f174f',
              }}
            >
              <span
                className="absolute rounded-full bg-wisteria-50 transition-all"
                style={{
                  width: 20,
                  height: 20,
                  top: 4,
                  left: form.is_published ? 24 : 4,
                }}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="rounded-full bg-elevated px-5 py-2.5 font-plein-medium text-sm text-text-secondary hover:bg-elevated/70 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-wisteria-300 px-5 py-2.5 font-plein-medium text-sm text-wisteria-950 hover:bg-wisteria-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete content"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}