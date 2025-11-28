# Panduan Instalasi & Setup - MySQL2

Dokumentasi lengkap untuk setup website Portal Berita Kabupaten Merauke menggunakan mysql2.

## Prerequisites

Pastikan sistem Anda telah memiliki:

- **Node.js** 18.0.0 atau lebih tinggi
- **npm** atau **yarn** atau **pnpm**
- **MySQL** 8.0 atau lebih tinggi
- **Git** (opsional, untuk version control)

## Langkah Instalasi

### 1. Clone atau Download Project

```bash
# Jika menggunakan Git
git clone <repository-url>
cd merauke-news-portal

# Atau extract file ZIP jika download manual
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Database MySQL

#### A. Buat Database

Login ke MySQL dan buat database baru:

```sql
CREATE DATABASE merauke_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### B. Buat User Database (Opsional tapi disarankan)

```sql
CREATE USER 'merauke_user'@'localhost' IDENTIFIED BY 'password_anda';
GRANT ALL PRIVILEGES ON merauke_portal.* TO 'merauke_user'@'localhost';
FLUSH PRIVILEGES;
```

#### C. Import Schema Database

Jalankan file SQL schema untuk membuat tabel:

```bash
# Login ke MySQL
mysql -u merauke_user -p merauke_portal

# Di MySQL prompt, jalankan:
source database/schema.sql;

# Atau dari command line langsung:
mysql -u merauke_user -p merauke_portal < database/schema.sql
```

#### D. Import Seed Data (Opsional)

Untuk mengisi database dengan data contoh:

```bash
mysql -u merauke_user -p merauke_portal < database/seed.sql
```

### 4. Konfigurasi Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Database Configuration
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="merauke_user"
DB_PASSWORD="password_anda"
DB_NAME="merauke_portal"

# Next.js Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Portal Berita Kabupaten Merauke"
```

### 5. Test Database Connection

Project akan otomatis test koneksi database saat pertama kali run. Pastikan melihat pesan:

```
✅ Database connected successfully
```

### 6. Run Development Server

```bash
npm run dev
```

Buka browser dan akses: `http://localhost:3000`

## Struktur Database

### Tabel Utama

1. **users** - Data admin/author
2. **kategori** - Kategori berita
3. **berita** - Artikel berita
4. **tags** - Tag untuk berita
5. **berita_tags** - Junction table (Many-to-Many)
6. **komentar** - Komentar pada berita
7. **statistik** - Data statistik daerah
8. **banner** - Banner/slider homepage
9. **galeri** - Galeri foto
10. **settings** - Pengaturan website
11. **newsletter** - Email subscribers

### Entity Relationship Diagram (ERD)

```
┌─────────┐          ┌──────────┐          ┌─────────┐
│  users  │──1:N────>│  berita  │<────N:1──│kategori │
└─────────┘          └──────────┘          └─────────┘
                           │
                           │ N:N (via berita_tags)
                           │
                      ┌─────────┐
                      │  tags   │
                      └─────────┘
                           
┌──────────┐
│ komentar │────N:1────> berita
└──────────┘
```

## Perintah NPM Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Production server
npm run lint          # ESLint check
npm run db:migrate    # Run database migrations (if any)
npm run db:seed       # Seed database dengan data contoh
```

## Database Helpers & Models

Project ini menggunakan pendekatan Repository Pattern dengan helper functions.

### DB Helpers (`lib/db-helpers.ts`)

```typescript
import { query, queryOne, execute, transaction } from '@/lib/db-helpers'

// SELECT multiple rows
const users = await query('SELECT * FROM users WHERE role = ?', ['ADMIN'])

// SELECT single row
const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId])

// INSERT/UPDATE/DELETE
const result = await execute('INSERT INTO kategori (id, nama, slug) VALUES (?, ?, ?)', 
  [uuid, 'Pemerintahan', 'pemerintahan'])

// Transaction
await transaction([
  { query: 'INSERT INTO ...', params: [...] },
  { query: 'UPDATE ...', params: [...] }
])
```

### Repository Pattern (`lib/models/berita.ts`)

```typescript
import { BeritaRepository } from '@/lib/models/berita'

// Get all with pagination
const result = await BeritaRepository.findAll({
  page: 1,
  limit: 10,
  kategori_id: 'uuid',
  is_published: true
})

// Get by slug
const berita = await BeritaRepository.findBySlug('judul-berita')

// Create
const id = await BeritaRepository.create({
  judul: 'Judul Berita',
  slug: 'judul-berita',
  excerpt: 'Ringkasan...',
  konten: 'Konten lengkap...',
  kategori_id: 'uuid',
  author_id: 'uuid'
})

// Update
await BeritaRepository.update(id, {
  judul: 'Judul Updated'
})

// Delete
await BeritaRepository.delete(id)
```

## Konfigurasi Production

### 1. Build Project

```bash
npm run build
```

### 2. Setup Environment Variables Production

Pastikan `.env` di production memiliki konfigurasi yang benar:

```env
DB_HOST="production-db-host"
DB_PORT="3306"
DB_USER="prod_user"
DB_PASSWORD="secure_password"
DB_NAME="merauke_portal_prod"

NEXT_PUBLIC_SITE_URL="https://meraukekab.go.id"
NODE_ENV="production"
```

### 3. Jalankan Production Server

```bash
npm run start
```

Atau gunakan PM2 untuk process management:

```bash
# Install PM2 global
npm install -g pm2

# Start dengan PM2
pm2 start npm --name "merauke-portal" -- start

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup
```

## Deployment ke Server

### Option 1: Deploy ke VPS (Ubuntu/Debian)

1. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install MySQL**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

3. **Setup MySQL Database**
```bash
# Login ke MySQL
sudo mysql

# Create database dan user
CREATE DATABASE merauke_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'merauke_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON merauke_portal.* TO 'merauke_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u merauke_user -p merauke_portal < database/schema.sql
mysql -u merauke_user -p merauke_portal < database/seed.sql
```

4. **Upload Project**
```bash
# Gunakan Git, SCP, atau FTP untuk upload project
# Contoh dengan Git:
cd /var/www
git clone <repository-url> merauke-portal
cd merauke-portal
npm install
npm run build
```

5. **Setup Nginx Reverse Proxy**

Edit `/etc/nginx/sites-available/merauke-portal`:

```nginx
server {
    listen 80;
    server_name meraukekab.go.id www.meraukekab.go.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/merauke-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. **Install SSL Certificate**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d meraukekab.go.id -d www.meraukekab.go.id
```

7. **Setup PM2**
```bash
pm2 start npm --name "merauke-portal" -- start
pm2 save
pm2 startup
```

### Option 2: Deploy ke Cloud (Railway, Render, dll)

Untuk deployment ke cloud platform:

1. **Setup Environment Variables** di dashboard platform
2. **Connect Repository** (Git)
3. **Configure Build Command**: `npm run build`
4. **Configure Start Command**: `npm start`
5. **Setup MySQL Database** (gunakan managed database)

## Troubleshooting

### Error: Connection Refused (MySQL)

```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Check port
sudo netstat -tlnp | grep mysql
```

### Error: Access Denied for User

```bash
# Reset MySQL user password
sudo mysql
ALTER USER 'merauke_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Error: Module Not Found

```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: Can't connect to MySQL server

Pastikan:
- MySQL service running
- DB_HOST, DB_PORT benar
- Firewall tidak blocking port 3306
- User memiliki permission

### Port 3000 Already in Use

```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Atau gunakan port lain
PORT=3001 npm run dev
```

## Backup Database

### Manual Backup

```bash
# Backup
mysqldump -u merauke_user -p merauke_portal > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u merauke_user -p merauke_portal < backup_20241128_120000.sql
```

### Automated Backup (Cron)

Buat script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u merauke_user -pPASSWORD merauke_portal > $BACKUP_DIR/merauke_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "merauke_*.sql" -mtime +7 -delete
```

Setup cron:
```bash
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Database Migrations

Jika ada perubahan schema di masa depan, buat file migration:

```sql
-- migrations/001_add_column_example.sql
ALTER TABLE berita ADD COLUMN meta_title VARCHAR(255) NULL AFTER slug;
ALTER TABLE berita ADD COLUMN meta_description TEXT NULL AFTER meta_title;
```

Jalankan:
```bash
mysql -u merauke_user -p merauke_portal < migrations/001_add_column_example.sql
```

## Performance Tips

### 1. Database Optimization

```sql
-- Analyze tables
ANALYZE TABLE berita, kategori, users;

-- Optimize tables
OPTIMIZE TABLE berita, kategori, users;

-- Check indexes
SHOW INDEX FROM berita;
```

### 2. Connection Pooling

Sudah diimplementasi di `lib/db.ts` dengan configuration:
- `connectionLimit: 10` - Max 10 concurrent connections
- `waitForConnections: true` - Queue jika pool full
- `enableKeepAlive: true` - Keep connection alive

### 3. Query Optimization

- Gunakan `LIMIT` untuk pagination
- Gunakan index untuk kolom yang sering di-query
- Avoid `SELECT *`, pilih column spesifik
- Gunakan `EXPLAIN` untuk analyze query

## Support & Contact

Untuk bantuan lebih lanjut, hubungi:
- Email: support@meraukekab.go.id
- Website: https://meraukekab.go.id

---

**Copyright © 2024 Pemerintah Kabupaten Merauke**
