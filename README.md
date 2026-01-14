# Task Manager Application

İş takip sistemi - Modern web tabanlı görev yönetim uygulaması

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler

- **Kullanıcı Yönetimi**
  - Email/Password ile giriş
  - JWT token tabanlı authentication
  - Admin ve User rolleri
  - Kullanıcı oluşturma (sadece admin)

- **İş Takip Sistemi**
  - İş kartları oluşturma, düzenleme, silme
  - Müşteri, Partner, Kapsam bilgileri
  - Ücret ve maliyet takibi
  - Sorumlu kişi ataması
  - Durum takibi (Açık, Devam Ediyor, Tamamlandı, vb.)

- **Not Sistemi**
  - İş kartlarına not ekleme
  - Not geçmişi

- **Alarm Sistemi**
  - Tarih bazlı alarmlar
  - Email bildirimleri

- **API Güvenliği**
  - JWT Authentication
  - Role-based authorization
  - Password hashing (BCrypt)

### 🔄 Yapılacaklar

- [ ] React Frontend
- [ ] Excel/CSV/PDF Rapor Çıktıları
- [ ] Azure Deployment
- [ ] Arka plan email servisi (Hangfire)

## 🛠️ Teknolojiler

### Backend
- ASP.NET Core 9.0
- Entity Framework Core 9.0
- SQL Server
- JWT Authentication
- BCrypt.Net
- Swagger/OpenAPI

### Frontend (Planlanan)
- React 18
- Material-UI / Ant Design
- Axios
- React Router

## 📋 Gereksinimler

- .NET 9.0 SDK
- Node.js 18+ (Frontend için)
- Azure SQL Database veya SQL Server
- SMTP Email hesabı (Gmail, SendGrid, vb.)

## ⚙️ Kurulum

### 1. Backend Setup

```bash
cd Backend/TaskManager.API

# Paketleri yükle
dotnet restore

# Connection string'i güncelle (appsettings.json)
# - DefaultConnection: Azure SQL connection string
# - EmailSettings: SMTP bilgileri
# - JwtSettings: Production'da SecretKey değiştir

# Database migration oluştur
dotnet ef migrations add InitialCreate

# Database'i güncelle
dotnet ef database update

# Uygulamayı başlat
dotnet run
```

### 2. appsettings.json Yapılandırması

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER.database.windows.net;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;"
  },
  "JwtSettings": {
    "SecretKey": "CHANGE-THIS-SECRET-KEY-IN-PRODUCTION",
    "ExpirationMinutes": 480
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "your-email@gmail.com",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

### 3. İlk Kullanıcı (Seed Data)

Uygulama ilk çalıştığında otomatik olarak admin kullanıcı oluşturulur:

```
Email: admin@taskmanager.com
Password: Admin123!
```

⚠️ **Önemli**: Production'da bu kullanıcıyı değiştirin veya silin!

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/create-user` - Yeni kullanıcı oluştur (Admin)
- `GET /api/auth/users` - Kullanıcıları listele (Admin)
- `PUT /api/auth/users/{id}/toggle-active` - Kullanıcı aktif/pasif (Admin)

### Tasks

- `GET /api/tasks` - Tüm işleri listele
- `GET /api/tasks/{id}` - Tek iş detayı
- `POST /api/tasks` - Yeni iş oluştur
- `PUT /api/tasks/{id}` - İş güncelle
- `PUT /api/tasks/{id}/status` - İş durumu güncelle
- `DELETE /api/tasks/{id}` - İş sil (Admin)
- `POST /api/tasks/{id}/notes` - Not ekle
- `GET /api/tasks/{id}/notes` - Notları listele
- `POST /api/tasks/{id}/alarms` - Alarm ekle
- `GET /api/tasks/{id}/alarms` - Alarmları listele

### Health Check

- `GET /health` - Uygulama durumu

## 📖 Swagger Dokümantasyonu

Uygulama çalışırken şu adresten API dokümantasyonuna erişebilirsiniz:

```
https://localhost:5001/swagger
```

## 🔐 Güvenlik

- Tüm şifreler BCrypt ile hash'lenir
- JWT token 8 saat geçerlidir
- CORS tüm origin'lere açık (Production'da kısıtlayın!)
- HTTPS zorunlu

## 🌐 Azure Deployment

### Azure Kaynakları

- Resource Group: `MicrosoftSolutionApp`
- SQL Database: `msveritabani`
- App Service: (Oluşturulacak)
- SendGrid: Email servisi için

### Deployment Adımları

1. Azure Portal'dan App Service oluştur
2. GitHub/Azure DevOps ile CI/CD setup
3. Connection string'leri Azure App Service Configuration'a ekle
4. Deploy et

## 💰 Maliyet Tahmini (Azure)

- App Service (B1): ~$13/ay
- SQL Database (S0): ~$15/ay
- SendGrid (Free): $0
- **Toplam**: ~$28/ay

## 📝 Lisans

MIT License

## 👨‍💻 Geliştirici

Caner Akgün
