# Dokumentasi Sistem - Portal Berita Kabupaten Merauke

## Arsitektur Sistem

### Tech Stack Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  Next.js 16 (App Router) + React 19 + TypeScript   │
│  TailwindCSS + shadcn/ui Components                 │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│                  API/Backend Layer                   │
│     Next.js API Routes + Server Components          │
│            Prisma ORM + Validation                   │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│                   Database Layer                     │
│            MySQL 8.0 (Relational Database)          │
└─────────────────────────────────────────────────────┘
```

## Fitur Utama

### 1. Public Features (Frontend)

#### Homepage
- **Hero Section** dengan berita utama
- **Grid Berita Terkini** dengan infinite scroll
- **Statistik Daerah** (populasi, luas wilayah, UMKM, ekonomi)
- **Kategori Berita** dengan icon dan warna khas
- **CTA Section** untuk engagement

#### Halaman Berita
- **List View & Grid View** toggle
- **Filter berdasarkan kategori**
- **Search functionality** dengan autocomplete
- **Pagination** atau infinite scroll
- **Sort options** (terbaru, terpopuler, trending)

#### Detail Berita
- **Rich Text Content** dengan typography profesional
- **Featured Image** + galeri foto
- **Meta Information** (author, tanggal, views, reading time)
- **Social Share Buttons** (Facebook, Twitter, WhatsApp)
- **Related News** sidebar
- **Popular News** sidebar
- **Tags** untuk navigasi topik
- **Comment Section** (coming soon)

#### Kategori
- **Pemerintahan** - Berita kebijakan dan program pemerintah
- **Pembangunan** - Infrastruktur dan proyek pembangunan
- **Pendidikan** - Berita pendidikan dan sekolah
- **Kesehatan** - Info kesehatan dan layanan kesehatan
- **UMKM & Ekonomi** - Berita ekonomi dan UMKM
- **Pariwisata** - Destinasi wisata dan event
- **Budaya** - Kesenian dan budaya lokal
- **Sosial** - Kegiatan sosial kemasyarakatan

#### Halaman Lainnya
- **Tentang Kami** - Profil Kabupaten Merauke
- **Kontak** - Informasi kontak dan form
- **Galeri** - Foto dan video kegiatan
- **Statistik** - Dashboard data daerah

### 2. Admin Features (Dashboard)

#### Dashboard Overview
- **Analytics** (views, visitor stats)
- **Recent Activities**
- **Quick Actions**

#### Manajemen Berita
- **Create News** dengan rich text editor
- **Edit & Delete News**
- **Draft & Published status**
- **Schedule Publishing**
- **Featured/Highlight News**
- **SEO Settings** per artikel

#### Manajemen Kategori
- **CRUD Operations**
- **Icon & Color Customization**
- **Reorder Categories**

#### Manajemen Media
- **Image Upload** dengan preview
- **Media Library**
- **Image Optimization**
- **Bulk Upload**

#### User Management
- **User Roles** (Admin, Editor, Author)
- **Permissions Control**
- **Activity Logs**

#### Settings
- **Site Settings** (nama, logo, deskripsi)
- **Social Media Links**
- **Banner/Slider Management**
- **Statistics Configuration**
- **SEO Global Settings**

## Design System

### Color Palette

```css
Primary (Blue): 
- 50: #eff6ff
- 500: #3b82f6 (Main)
- 900: #1e3a8a

Accent (Gold):
- 500: #eab308 (Main)
- 700: #a16207

Semantic:
- Success: #10b981
- Warning: #f59e0b
- Error: #ef4444
- Info: #3b82f6
```

### Typography

```
Headings: Geist Sans (Bold)
- H1: 2.5rem (40px) - Bold
- H2: 2rem (32px) - Bold
- H3: 1.5rem (24px) - Semibold
- H4: 1.25rem (20px) - Semibold

Body: Geist Sans
- Large: 1.125rem (18px)
- Base: 1rem (16px)
- Small: 0.875rem (14px)
- XSmall: 0.75rem (12px)

Code: Geist Mono
```

### Spacing System

```
Base unit: 4px (0.25rem)
- xs: 8px (0.5rem)
- sm: 12px (0.75rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)
```

### Border Radius

```
- sm: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)
- 2xl: 1.5rem (24px)
- full: 9999px
```

### Shadows

```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.07)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.15)
```

## Component Library

### shadcn/ui Components Used

1. **Button** - Primary, Secondary, Outline, Ghost variants
2. **Card** - Container untuk content
3. **Badge** - Labels dan tags
4. **Input** - Form inputs
5. **Avatar** - User avatars
6. **Sheet** - Mobile navigation
7. **Dialog** - Modals
8. **Separator** - Dividers
9. **Tabs** - Tab navigation
10. **Toast** - Notifications

### Custom Components

1. **Header** - Navigation dan search
2. **Footer** - Footer dengan links
3. **NewsHero** - Hero section berita utama
4. **NewsCard** - Card berita dengan variants
5. **StatsSection** - Statistik daerah
6. **CategorySection** - Grid kategori

## Database Schema Details

### Relationships

```
User (1) ──────── (N) Berita
Kategori (1) ───── (N) Berita
Berita (N) ──────── (N) Tag (Many-to-Many)
Berita (1) ──────── (N) Komentar
```

### Indexes

```sql
-- Berita
INDEX idx_slug (slug)
INDEX idx_kategori_id (kategoriId)
INDEX idx_published_at (publishedAt)
INDEX idx_is_published (isPublished)

-- Komentar
INDEX idx_berita_id (beritaId)
INDEX idx_is_approved (isApproved)
```

## API Endpoints

### Public API

```
GET  /api/berita              - List berita (with filters)
GET  /api/berita/[slug]       - Detail berita
GET  /api/kategori            - List kategori
GET  /api/kategori/[slug]     - Berita by kategori
GET  /api/statistik           - Statistik daerah
GET  /api/search?q=keyword    - Search berita
```

### Admin API (Protected)

```
POST   /api/admin/berita      - Create berita
PUT    /api/admin/berita/[id] - Update berita
DELETE /api/admin/berita/[id] - Delete berita
POST   /api/admin/media       - Upload media
GET    /api/admin/analytics   - Get analytics
```

## Performance Optimization

### 1. Image Optimization
- Next.js Image Component
- Lazy loading
- WebP format
- Responsive images

### 2. Code Splitting
- Dynamic imports
- Route-based splitting
- Component lazy loading

### 3. Caching Strategy
```javascript
// Static Generation (SSG)
export const revalidate = 3600 // 1 hour

// Incremental Static Regeneration (ISR)
export const revalidate = 60 // 1 minute
```

### 4. Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Prepared statements

## SEO Optimization

### Meta Tags
```typescript
export const metadata = {
  title: 'Judul Halaman',
  description: 'Deskripsi halaman',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'Judul untuk social media',
    description: 'Deskripsi untuk social media',
    images: ['/og-image.jpg'],
  },
}
```

### Structured Data
- JSON-LD untuk artikel
- BreadcrumbList
- Organization
- WebSite

## Security

### 1. Authentication & Authorization
- Secure password hashing (bcrypt)
- JWT tokens
- Role-based access control

### 2. Input Validation
- Zod schema validation
- XSS prevention
- SQL injection prevention (Prisma)

### 3. Rate Limiting
- API rate limiting
- Login attempt limiting

### 4. CORS Configuration
```javascript
{
  origin: ['https://meraukekab.go.id'],
  credentials: true,
}
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] DNS configured
- [ ] Analytics setup (Google Analytics)
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Error monitoring setup (Sentry)
- [ ] Backup strategy implemented
- [ ] CDN configured (optional)

## Maintenance

### Daily
- Monitor server status
- Check error logs
- Review analytics

### Weekly
- Database backup
- Security updates check
- Content review

### Monthly
- Performance audit
- Dependency updates
- SEO audit
- User feedback review

## Future Enhancements

### Phase 2
- [ ] Comment system with moderation
- [ ] Newsletter subscription
- [ ] Advanced search with filters
- [ ] Multi-language support (Indonesian & English)
- [ ] PWA (Progressive Web App)

### Phase 3
- [ ] Mobile apps (React Native)
- [ ] Push notifications
- [ ] Video streaming
- [ ] Live blog/live updates
- [ ] Chatbot integration

### Phase 4
- [ ] AI-powered content recommendations
- [ ] Advanced analytics dashboard
- [ ] Integration with social media APIs
- [ ] E-paper/Digital magazine

---

**Last Updated:** November 2024
**Version:** 1.0.0
**Author:** Development Team - Kabupaten Merauke
