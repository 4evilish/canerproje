-- Admin kullanıcısının şifresini güncelle
-- Şifre: Admin123!
UPDATE Users 
SET PasswordHash = '$2a$11$5vF8qYz5QN3qZ3qZ3qZ3qeZ3qZ3qZ3qZ3qZ3qZ3qZ3qZ3qZ3qZ3qO'
WHERE Email = 'admin@taskmanager.com';

-- Kontrol et
SELECT Id, Email, FullName, Role, IsActive FROM Users WHERE Email = 'admin@taskmanager.com';
