import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Toggle } from '../components/ui/PageHeader';
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

export function EducationalContentPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setItems(await fetchContent());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      body: item.body,
      featured_image_url: item.featured_image_url || '',
      is_published: item.is_published,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    await saveContent({ ...form, id: editId || undefined });
    showToast(editId ? 'Content updated' : 'Content created');
    setModalOpen(false);
    load();
  }

  async function togglePublish(item) {
    await saveContent({ ...item, is_published: !item.is_published });
    showToast(item.is_published ? 'Content unpublished' : 'Content published');
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteContent(deleteTarget.id);
    showToast('Content deleted', 'warning');
    setDeleteTarget(null);
    load();
  }

  return (
    <div className="page">
      <PageHeader
        title="Educational Content Management"
        subtitle="Manage articles and guides for users"
        actions={
          <button type="button" className="btn btn--primary" onClick={openNew}>
            Add New Content
          </button>
        }
      />

      <div className="card section">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Published</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    No content yet
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>
                      <Badge variant="neutral">{formatCategory(item.category)}</Badge>
                    </td>
                    <td>
                      <Toggle
                        checked={item.is_published}
                        onChange={() => togglePublish(item)}
                        label={item.is_published ? 'Published' : 'Draft'}
                      />
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => togglePublish(item)}
                        >
                          {item.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => setDeleteTarget(item)}
                        >
                          Delete
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

      <Modal
        open={modalOpen}
        title={editId ? 'Edit Content' : 'Add New Content'}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="stack-form">
          <label className="field">
            <span className="field__label">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {formatCategory(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Content body</span>
            <textarea
              rows={8}
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">Featured Image URL (optional)</span>
            <input
              type="url"
              value={form.featured_image_url}
              onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
            />
          </label>
          <Toggle
            checked={form.is_published}
            onChange={(v) => setForm({ ...form, is_published: v })}
            label="Published"
          />
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete content"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
