import { useState, useEffect } from 'react';
import { taskCategoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/TaskCategorySelect.css';

function TaskCategorySelect({ value, onChange, required }) {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await taskCategoriesAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      const response = await taskCategoriesAPI.createCategory(newCategoryName.trim());
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setShowAddModal(false);
      onChange(response.data.id);
    } catch (error) {
      alert('Hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, categoryName) => {
    if (!window.confirm(`"${categoryName}" görevini silmek istediğinizden emin misiniz?`)) return;

    try {
      await taskCategoriesAPI.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      if (value === id) {
        onChange(null);
      }
    } catch (error) {
      alert('Silme hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="category-select-wrapper">
      <div className="category-select-container">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          required={required}
          className="category-select"
        >
          <option value="">Görev Seçiniz...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-add-category"
          title="Yeni Görev Ekle"
        >
          +
        </button>
      </div>

      {/* Kategorileri Yönetme Listesi (Sadece Admin) */}
      {isAdmin() && categories.length > 0 && (
        <div className="category-management">
          <details>
            <summary>Görev Listesini Yönet</summary>
            <ul className="category-list">
              {categories.map(cat => (
                <li key={cat.id}>
                  <span>{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="btn-delete-small"
                    title="Sil"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Yeni Görev Ekle</h3>
            <div>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Görev adı..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory(e);
                  }
                }}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-cancel">
                  İptal
                </button>
                <button type="button" onClick={handleAddCategory} disabled={loading} className="btn-save">
                  {loading ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCategorySelect;
