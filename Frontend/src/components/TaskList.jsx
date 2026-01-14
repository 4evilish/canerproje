import '../styles/TaskList.css';

const statusLabels = {
  Open: 'Açık',
  InProgress: 'Devam Ediyor',
  Completed: 'Tamamlandı',
  OnHold: 'Beklemede',
  Cancelled: 'İptal'
};

const statusColors = {
  Open: '#3b82f6',
  InProgress: '#f59e0b',
  Completed: '#10b981',
  OnHold: '#6b7280',
  Cancelled: '#ef4444'
};

function TaskList({ tasks, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>Henüz iş kaydı bulunmuyor.</p>
        <p>Yeni bir iş eklemek için yukarıdaki butonu kullanın.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-container">
        <div className="task-list-header">
          <div className="col-customer">Müşteri</div>
          <div className="col-category">Görev</div>
          <div className="col-scope">Kapsam</div>
          <div className="col-responsible">Sorumlu</div>
          <div className="col-fee">Ücret</div>
          <div className="col-cost">Maliyet</div>
          <div className="col-profit">Kar</div>
          <div className="col-date">Açılış</div>
          <div className="col-status">Durum</div>
          <div className="col-actions">İşlemler</div>
        </div>
      
        {tasks.map((task) => (
          <div key={task.id} className="task-row">
          <div className="col-customer">{task.customerName}</div>
          <div className="col-category">{task.taskCategoryName || '-'}</div>
          <div className="col-scope">{task.scope || '-'}</div>
          <div className="col-responsible">{task.responsibleUserName}</div>
          <div className="col-fee">{formatCurrency(task.fee)}</div>
          <div className="col-cost">{formatCurrency(task.cost)}</div>
          <div className={`col-profit ${task.fee - task.cost >= 0 ? 'profit' : 'loss'}`}>
            {formatCurrency(task.fee - task.cost)}
          </div>
          <div className="col-date">{formatDate(task.openDate)}</div>
          <div className="col-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: statusColors[task.status] }}
            >
              {statusLabels[task.status]}
            </span>
          </div>
          <div className="col-actions">
            <button onClick={() => onEdit(task)} className="btn-primary btn-sm">
              Düzenle
            </button>
            {onDelete && (
              <button onClick={() => onDelete(task.id)} className="btn-danger btn-sm">
                Sil
              </button>
            )}
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskList;
