import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styles/UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'User'
  });
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    role: '',
    password: ''
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Kullanıcılar yüklenemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      await authAPI.createUser(formData);
      setShowCreateModal(false);
      setFormData({ email: '', password: '', fullName: '', role: 'User' });
      loadUsers();
      alert('Kullanıcı başarıyla oluşturuldu!');
    } catch (error) {
      alert('Hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (userToEdit) => {
    setEditingUser(userToEdit);
    // Ensure role is string (User/Admin)
    const roleValue = userToEdit.Role || userToEdit.role;
    const roleString = typeof roleValue === 'string' ? roleValue : (roleValue === 1 ? 'Admin' : 'User');
    
    setEditFormData({
      fullName: userToEdit.fullName,
      role: roleString,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData = {
        fullName: editFormData.fullName,
        role: editFormData.role
      };

      // Only include password if it's been changed
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      await authAPI.updateUser(editingUser.id, updateData);
      setShowEditModal(false);
      setEditingUser(null);
      setEditFormData({ fullName: '', role: '', password: '' });
      loadUsers();
      alert('Kullanıcı başarıyla güncellendi!');
    } catch (error) {
      alert('Hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    const action = currentStatus ? 'deaktif' : 'aktif';
    if (!window.confirm(`Bu kullanıcıyı ${action} etmek istediğinizden emin misiniz?`)) return;

    try {
      await authAPI.toggleUserActive(userId);
      loadUsers();
    } catch (error) {
      alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="user-management">
      <header className="page-header">
        <div>
          <h1>Kullanıcı Yönetimi</h1>
          <p>Hoş geldiniz, {user?.fullName}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="btn-secondary">
            ← Dashboard'a Dön
          </button>
          <button onClick={handleLogout} className="btn-danger">
            Çıkış
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="toolbar">
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            + Yeni Kullanıcı Ekle
          </button>
        </div>

        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th>Son Giriş</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={!u.isActive ? 'inactive' : ''}>
                    <td className="user-name">{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.Role === 'Admin' || u.role === 'Admin' ? 'admin' : 'user'}`}>
                        {u.Role || u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? 'Aktif' : 'Deaktif'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td>
                      {u.lastLoginAt 
                        ? new Date(u.lastLoginAt).toLocaleString('tr-TR', { 
                            dateStyle: 'short', 
                            timeStyle: 'short' 
                          })
                        : '-'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="btn-sm btn-edit"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className={`btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`}
                          disabled={u.id === user?.id}
                          title={u.id === user?.id ? 'Kendi hesabınızı deaktif edemezsiniz' : ''}
                        >
                          {u.isActive ? 'Deaktif Et' : 'Aktif Et'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="empty-state">
                Henüz kullanıcı bulunmuyor.
              </div>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Kullanıcı Düzenle</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleUpdateUser} className="user-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser?.email || ''}
                  disabled
                  className="disabled-input"
                />
                <small style={{color: '#666', fontSize: '12px'}}>Email değiştirilemez</small>
              </div>

              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  name="fullName"
                  value={editFormData.fullName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  required
                >
                  <option value="User">Kullanıcı</option>
                  <option value="Admin">Yönetici</option>
                </select>
              </div>

              <div className="form-group">
                <label>Yeni Şifre</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditChange}
                  minLength="6"
                  placeholder="Değiştirmek için yeni şifre girin"
                />
                <small style={{color: '#666', fontSize: '12px'}}>Boş bırakırsanız şifre değişmez</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={updating} className="btn-primary">
                  {updating ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yeni Kullanıcı Ekle</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="ornek@email.com"
                />
              </div>

              <div className="form-group">
                <label>Şifre *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="En az 6 karakter"
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="User">Kullanıcı</option>
                  <option value="Admin">Yönetici</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
