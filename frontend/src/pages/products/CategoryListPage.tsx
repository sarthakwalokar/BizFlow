import React, { useState, useEffect } from 'react';
import { categoriesApi, Category, CategoryRequest } from '../../api/categories';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Tag,
} from 'lucide-react';

export const CategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setErrorMessage('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setName('');
    setDescription('');
    setActive(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setActive(category.active);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: CategoryRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      active,
    };

    try {
      await categoriesApi.createCategory(payload);
      setSuccessMessage(`Category "${payload.name}" created.`);
      setIsAddModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to create category.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !name.trim()) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: CategoryRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      active,
    };

    try {
      await categoriesApi.updateCategory(editingCategory.id, payload);
      setSuccessMessage(`Category "${payload.name}" updated.`);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update category.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await categoriesApi.deleteCategory(deletingCategory.id);
      setSuccessMessage(`Category "${deletingCategory.name}" removed.`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to delete category.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Categories</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize catalog products and services into customer-friendly groups.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={15} className="text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-card">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-zinc-400">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-white rounded-2xl border border-zinc-200 p-8 space-y-1">
            <FolderTree size={32} className="mx-auto text-zinc-300" />
            <p className="font-bold text-zinc-700">No categories found</p>
            <p className="text-xs text-zinc-400">Create your first category to group catalog items.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card flex flex-col justify-between space-y-3 hover:border-zinc-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <Tag size={16} />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900">{cat.name}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end space-x-1.5">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  onClick={() => setDeletingCategory(cat)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Tag size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hot Beverages, Desserts, Spa Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of items in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-emerald-600 resize-none"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"
                />
                <span className="text-xs font-semibold text-zinc-800">Active in POS and catalog</span>
              </label>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <Trash2 size={20} />
              <h3 className="text-base font-bold text-zinc-900">Delete Category</h3>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete category{' '}
              <strong className="text-zinc-900">"{deletingCategory.name}"</strong>?
              Items assigned to this category will become uncategorized.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
