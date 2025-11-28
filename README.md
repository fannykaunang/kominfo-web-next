# Portal Berita Pemerintah Kabupaten Merauke

Website portal berita modern untuk Pemerintah Daerah Kabupaten Merauke yang dibangun dengan Next.js 16, shadcn/ui, TailwindCSS, dan MySQL.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: TailwindCSS
- **Database**: MySQL 8.0
- **Database Library**: mysql2
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## Fitur Utama

1. **Homepage Modern**
   - Hero section dengan berita utama
   - Grid berita terkini
   - Kategori berita
   - Statistik daerah
   - Galeri foto/video

2. **Kategori Berita**
   - Pemerintahan
   - Pembangunan
   - Pendidikan
   - Kesehatan
   - UMKM & Ekonomi
   - Pariwisata
   - Budaya

3. **Halaman Detail Berita**
   - Layout artikel modern
   - Share social media
   - Berita terkait
   - Komentar

4. **Dashboard Admin**
   - Manajemen berita
   - Manajemen kategori
   - Upload media
   - Analytics

5. **Fitur Tambahan**
   - Search functionality
   - Dark/Light mode
   - Responsive design
   - SEO optimized
   - PWA ready

## Struktur Folder

```
merauke-news-portal/
├── app/
│   ├── (admin)/
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── berita/
│   │       └── kategori/
│   ├── (public)/
│   │   ├── berita/
│   │   │   └── [slug]/
│   │   ├── kategori/
│   │   │   └── [slug]/
│   │   ├── tentang/
│   │   └── kontak/
│   ├── api/
│   │   ├── berita/
│   │   ├── kategori/
│   │   └── statistik/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── navbar.tsx
│   ├── berita/
│   │   ├── news-card.tsx
│   │   ├── news-hero.tsx
│   │   └── news-grid.tsx
│   └── home/
│       ├── stats-section.tsx
│       └── category-section.tsx
├── lib/
│   ├── db.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
└── public/
    └── images/
```

## Instalasi

```bash
# Clone repository
git clone [repository-url]
cd merauke-news-portal

# Install dependencies
npm install

# Setup .env
cp .env.example .env
# Edit .env dengan database credentials Anda

# Create database
mysql -u root -p
CREATE DATABASE merauke_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Import schema
mysql -u root -p merauke_portal < database/schema.sql

# Import seed data (optional)
mysql -u root -p merauke_portal < database/seed.sql

# Run development server
npm run dev
```

Untuk panduan lengkap, lihat [INSTALLATION_MYSQL2.md](./INSTALLATION_MYSQL2.md)

## Database Schema

Database menggunakan MySQL 8.0 dengan struktur tabel:

### Tabel Utama:
- **users** - Admin/Author management
- **kategori** - News categories  
- **berita** - News articles (main content)
- **tags** - Article tags
- **berita_tags** - Many-to-many junction table
- **komentar** - Comments system
- **statistik** - Regional statistics
- **banner** - Homepage sliders
- **galeri** - Photo gallery
- **settings** - Website settings
- **newsletter** - Email subscribers

Lihat file `database/schema.sql` untuk detail lengkap schema database.

### Database Access Pattern

Project menggunakan **Repository Pattern** dengan mysql2:

```typescript
// Menggunakan Repository
import { BeritaRepository } from '@/lib/models/berita'

const result = await BeritaRepository.findAll({ page: 1, limit: 10 })
const berita = await BeritaRepository.findBySlug('slug')

// Raw query jika needed
import { query, queryOne, execute } from '@/lib/db-helpers'

const results = await query('SELECT * FROM berita WHERE kategori_id = ?', [id])
```

## Design System

- **Primary Color**: Blue (khas pemerintahan)
- **Accent Color**: Gold (mencerminkan kearifan lokal)
- **Font**: Geist Sans untuk readability
- **Border Radius**: Modern dengan rounded-xl
- **Spacing**: Consistent spacing system

## License

Copyright © 2024 Pemerintah Kabupaten Merauke
