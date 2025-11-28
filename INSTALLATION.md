# Panduan Instalasi & Setup

Dokumentasi lengkap untuk setup website Portal Berita Kabupaten Merauke.

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

### 4. Konfigurasi Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
DATABASE_URL="mysql://merauke_user:password_anda@localhost:3306/merauke_portal"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Portal Berita Kabupaten Merauke"
```

### 5. Generate Prisma Client & Push Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database (membuat tabel)
npx prisma db push
```

### 6. Seed Database (Opsional)

Untuk mengisi database dengan data contoh:

```bash
npm run db:seed
```

### 7. Run Development Server

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
5. **komentar** - Komentar pada berita
6. **statistik** - Data statistik daerah
7. **banner** - Banner/slider homepage
8. **galeri** - Galeri foto
9. **settings** - Pengaturan website

## Perintah NPM Scripts

```bash
# Development
npm run dev              # Jalankan development server

# Production
npm run build            # Build untuk production
npm run start            # Jalankan production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema ke database
npm run db:studio        # Buka Prisma Studio (GUI database)
npm run db:seed          # Seed data contoh

# Linting
npm run lint             # Check code quality
```

## Konfigurasi Production

### 1. Build Project

```bash
npm run build
```

### 2. Setup Environment Variables Production

Pastikan `.env` di production memiliki konfigurasi yang benar:

```env
DATABASE_URL="mysql://user:password@production-host:3306/database"
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

3. **Install Nginx**
```bash
sudo apt install nginx
```

4. **Upload Project**
```bash
# Gunakan Git, SCP, atau FTP untuk upload project
```

5. **Setup Nginx Reverse Proxy**
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
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Install SSL Certificate**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d meraukekab.go.id -d www.meraukekab.go.id
```

### Option 2: Deploy ke Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login dan deploy:
```bash
vercel login
vercel --prod
```

3. Setup environment variables di Vercel dashboard

**Note:** Untuk Vercel, Anda perlu menggunakan database cloud seperti PlanetScale, Railway, atau AWS RDS karena Vercel adalah serverless.

## Troubleshooting

### Error: Connection Refused (MySQL)

- Pastikan MySQL service running: `sudo service mysql status`
- Check MySQL port: `sudo netstat -tlnp | grep mysql`
- Verify DATABASE_URL di `.env`

### Error: Module Not Found

```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: Prisma Client Not Generated

```bash
npx prisma generate
```

### Port 3000 Already in Use

```bash
# Ganti port dengan environment variable
PORT=3001 npm run dev
```

## Backup Database

```bash
# Backup
mysqldump -u merauke_user -p merauke_portal > backup_$(date +%Y%m%d).sql

# Restore
mysql -u merauke_user -p merauke_portal < backup_20241128.sql
```

## Update & Maintenance

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update Next.js specifically
npm install next@latest react@latest react-dom@latest
```

### Database Migration

Jika ada perubahan schema:

```bash
npx prisma db push
# atau
npx prisma migrate dev --name migration_name
```

## Support & Contact

Untuk bantuan lebih lanjut, hubungi:
- Email: support@meraukekab.go.id
- Website: https://meraukekab.go.id

---

**Copyright © 2024 Pemerintah Kabupaten Merauke**
