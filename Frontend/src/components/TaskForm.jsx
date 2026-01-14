import { useState, useEffect } from 'react';
import { tasksAPI, authAPI } from '../services/api';
import TaskCategorySelect from './TaskCategorySelect';
import '../styles/TaskForm.css';

function TaskForm({ task, onClose }) {
  const [formData, setFormData] = useState({
    customerName: '',
    taskCategoryId: null,
    partnerName: '',
    scope: '',
    fee: 0,
    cost: 0,
    description: '',
    openDate: new Date().toISOString().split('T')[0],
    closeDate: '',
    responsibleUserId: 1, // Default admin user
    responsibleInstitution: '',
    status: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    if (task) {
      setFormData({
        customerName: task.customerName || '',
        taskCategoryId: task.taskCategoryId || null,
        partnerName: task.partnerName || '',
        scope: task.scope || '',
        fee: task.fee || 0,
        cost: task.cost || 0,
        description: task.description || '',
        openDate: task.openDate?.split('T')[0] || '',
        closeDate: task.closeDate?.split('T')[0] || '',
        responsibleUserId: task.responsibleUserId || '',
        responsibleInstitution: task.responsibleInstitution || '',
        status: task.status ?? 0,
      });
    }
  }, [task]);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data.filter(u => u.isActive));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        taskCategoryId: formData.taskCategoryId ? parseInt(formData.taskCategoryId) : null,
        fee: parseFloat(formData.fee) || 0,
        cost: parseFloat(formData.cost) || 0,
        responsibleUserId: formData.responsibleUserId ? parseInt(formData.responsibleUserId) : 1,
        openDate: formData.openDate ? new Date(formData.openDate).toISOString() : new Date().toISOString(),
        closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : null,
        status: parseInt(formData.status) || 0,
      };

      if (task) {
        await tasksAPI.updateTask(task.id, payload);
      } else {
        await tasksAPI.createTask(payload);
      }
      
      onClose(true);
    } catch (error) {
      alert('Hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'İş Düzenle' : 'Yeni İş Ekle'}</h2>
          <button className="close-btn" onClick={() => onClose(false)}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
            <div className="form-group">
              <label>Müşteri Adı *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Görev</label>
              <TaskCategorySelect
                value={formData.taskCategoryId}
                onChange={(value) => setFormData(prev => ({ ...prev, taskCategoryId: value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kapsam</label>
              <input
                type="text"
                name="scope"
                value={formData.scope}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Partner Adı</label>
              <input
                type="text"
                name="partnerName"
                value={formData.partnerName}
                onChange={handleChange}
              />
            </div>
          </div>


          <div className="form-row">
            <div className="form-group">
              <label>Verilen Ücret</label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Maliyet</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Açılış Tarihi</label>
              <input
                type="date"
                name="openDate"
                value={formData.openDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Kapanış Tarihi</label>
              <input
                type="date"
                name="closeDate"
                value={formData.closeDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sorumlu Kişi</label>
              <select
                name="responsibleUserId"
                value={formData.responsibleUserId}
                onChange={handleChange}
              >
                <option value="">Seçiniz...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sorumlu Kurum</label>
              <input
                type="text"
                name="responsibleInstitution"
                value={formData.responsibleInstitution}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Durum</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="0">Açık</option>
              <option value="1">Devam Ediyor</option>
              <option value="2">Tamamlandı</option>
              <option value="3">Beklemede</option>
              <option value="4">İptal</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => onClose(false)} className="btn-secondary">
              İptal
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Kaydediliyor...' : task ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
