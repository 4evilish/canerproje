// CSV Export Utility

const statusLabels = {
  0: 'Açık',
  1: 'Devam Ediyor',
  2: 'Tamamlandı',
  3: 'Beklemede',
  4: 'İptal',
  Open: 'Açık',
  InProgress: 'Devam Ediyor',
  Completed: 'Tamamlandı',
  OnHold: 'Beklemede',
  Cancelled: 'İptal'
};

export const exportToCSV = (tasks, filename = 'isler') => {
  if (!tasks || tasks.length === 0) {
    alert('Dışa aktarılacak veri bulunamadı!');
    return;
  }

  // CSV header
  const headers = [
    'Müşteri Adı',
    'Görev',
    'Kapsam',
    'Partner',
    'Sorumlu Kişi',
    'Sorumlu Kurum',
    'Ücret (USD)',
    'Maliyet (USD)',
    'Kar (USD)',
    'Açılış Tarihi',
    'Kapanış Tarihi',
    'Durum',
    'Açıklama'
  ];

  // CSV rows
  const rows = tasks.map(task => {
    const profit = (task.fee || 0) - (task.cost || 0);
    const openDate = task.openDate ? new Date(task.openDate).toLocaleDateString('tr-TR') : '-';
    const closeDate = task.closeDate ? new Date(task.closeDate).toLocaleDateString('tr-TR') : '-';
    
    return [
      escapeCSV(task.customerName || '-'),
      escapeCSV(task.taskCategoryName || '-'),
      escapeCSV(task.scope || '-'),
      escapeCSV(task.partnerName || '-'),
      escapeCSV(task.responsibleUserName || '-'),
      escapeCSV(task.responsibleInstitution || '-'),
      formatNumber(task.fee || 0),
      formatNumber(task.cost || 0),
      formatNumber(profit),
      openDate,
      closeDate,
      statusLabels[task.status] || '-',
      escapeCSV(task.description || '-')
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Escape special characters for CSV
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '-';
  
  const stringValue = String(value);
  
  // If contains comma, quotes, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

// Format number with 2 decimals
const formatNumber = (num) => {
  return num.toFixed(2);
};
