import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, taskCategoriesAPI } from '../services/api';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { exportToCSV } from '../utils/csvExport';
import '../styles/Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, [filterStatus, filterCustomer, filterCategory]);

  useEffect(() => {
    loadCustomers();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCustomer) params.customer = filterCustomer;
      if (filterCategory) params.categoryId = filterCategory;
      
      const response = await tasksAPI.getTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await tasksAPI.getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await taskCategoriesAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Bu işi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await tasksAPI.deleteTask(id);
      loadTasks();
    } catch (error) {
      alert('İş silinemedi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFormClose = (success) => {
    setShowForm(false);
    setEditingTask(null);
    if (success) {
      loadTasks();
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/tasks/${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportCSV = () => {
    let filenameParts = [];
    
    if (filterCustomer) filenameParts.push(filterCustomer);
    if (filterCategory) {
      const cat = categories.find(c => c.id === parseInt(filterCategory));
      if (cat) filenameParts.push(cat.name);
    }
    if (filterStatus) {
      const statusName = ['Açık', 'Devam Ediyor', 'Tamamlandı', 'Beklemede', 'İptal'][
        ['Open', 'InProgress', 'Completed', 'OnHold', 'Cancelled'].indexOf(filterStatus)
      ];
      filenameParts.push(statusName);
    }
    
    const filename = filenameParts.length > 0 ? `isler_${filenameParts.join('_')}` : 'tum_isler';
    exportToCSV(tasks, filename);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>İş Takip Sistemi</h1>
          <p>Hoş geldiniz, {user?.fullName}</p>
        </div>
        <div className="header-actions">
          {isAdmin() && (
            <button onClick={() => navigate('/users')} className="btn-secondary">
              Kullanıcı Yönetimi
            </button>
          )}
          <button onClick={handleLogout} className="btn-danger">
            Çıkış
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="toolbar">
          <div className="toolbar-left">
            <button onClick={handleCreateTask} className="btn-primary">
              + Yeni İş Ekle
            </button>
            <button onClick={handleExportCSV} className="btn-export" disabled={tasks.length === 0}>
              📊 CSV İndir
            </button>
          </div>
          
          <div className="filters">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Durumlar</option>
              <option value="Open">Açık</option>
              <option value="InProgress">Devam Ediyor</option>
              <option value="Completed">Tamamlandı</option>
              <option value="OnHold">Beklemede</option>
              <option value="Cancelled">İptal</option>
            </select>

            <select 
              value={filterCustomer} 
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Müşteriler</option>
              {customers.map((customer, index) => (
                <option key={index} value={customer}>{customer}</option>
              ))}
            </select>

            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">Tüm Görevler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={isAdmin() ? handleDeleteTask : null}
          />
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

export default Dashboard;
