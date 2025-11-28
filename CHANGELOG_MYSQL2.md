# 🔄 CHANGELOG - Migration dari Prisma ke mysql2

## 📅 Update: November 2024

### ✅ Perubahan yang Dilakukan

#### 1. Dependencies Update

**Dihapus:**
- ❌ `@prisma/client`
- ❌ `prisma` (dev dependency)

**Ditambahkan:**
- ✅ `mysql2` v3.11.0

#### 2. Struktur File

**File Dihapus:**
```
❌ prisma/
   └── schema.prisma
```

**File Baru:**
```
✅ database/
   ├── schema.sql      - SQL schema untuk membuat tabel
   └── seed.sql        - Data contoh/seed

✅ lib/
   ├── db.ts           - MySQL connection pool (updated)
   ├── db-helpers.ts   - Helper functions untuk query
   └── models/
       └── berita.ts   - Repository pattern untuk Berita model
```

#### 3. Database Configuration

**Before (Prisma):**
```env
DATABASE_URL="mysql://user:pass@localhost:3306/db"
```

**After (mysql2):**
```env
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="password"
DB_NAME="merauke_portal"
```

#### 4. Database Setup

**Before (Prisma):**
```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

**After (mysql2):**
```bash
# Import schema manually
mysql -u user -p database < database/schema.sql

# Import seed data
mysql -u user -p database < database/seed.sql
```

#### 5. Query Pattern

**Before (Prisma ORM):**
```typescript
import { prisma } from '@/lib/db'

// Find all
const berita = await prisma.berita.findMany({
  where: { is_published: true },
  include: { kategori: true, author: true },
  orderBy: { created_at: 'desc' },
  take: 10,
  skip: 0
})

// Find one
const berita = await prisma.berita.findUnique({
  where: { slug: 'judul-berita' }
})

// Create
const berita = await prisma.berita.create({
  data: {
    judul: 'Judul',
    slug: 'slug',
    // ...
  }
})
```

**After (mysql2 dengan Repository Pattern):**
```typescript
import { BeritaRepository } from '@/lib/models/berita'

// Find all dengan pagination
const result = await BeritaRepository.findAll({
  page: 1,
  limit: 10,
  is_published: true
})
// result.data = array of berita
// result.pagination = { page, limit, total, totalPages }

// Find by slug
const berita = await BeritaRepository.findBySlug('judul-berita')

// Create
const id = await BeritaRepository.create({
  judul: 'Judul',
  slug: 'slug',
  // ...
})
```

**Raw Query (untuk custom needs):**
```typescript
import { query, queryOne, execute } from '@/lib/db-helpers'

// SELECT multiple
const results = await query('SELECT * FROM berita WHERE kategori_id = ?', [id])

// SELECT single
const result = await queryOne('SELECT * FROM berita WHERE id = ?', [id])

// INSERT/UPDATE/DELETE
const result = await execute('INSERT INTO berita (...) VALUES (?)', [values])
```

## 🎯 Keuntungan mysql2

### ✅ Pros
1. **Lebih Ringan** - Tidak ada ORM overhead
2. **Lebih Fleksibel** - Full control atas SQL queries
3. **Performance** - Direct SQL tanpa abstraction layer
4. **Familiar** - Native SQL yang familiar untuk DBA
5. **No Schema Lock** - Lebih mudah modifikasi schema
6. **Debugging** - Lebih mudah debug dengan raw SQL
7. **No Build Step** - Tidak perlu generate client

### ⚠️ Considerations
1. **Manual SQL** - Harus tulis SQL manual
2. **No Type Safety** - Tidak ada auto-generated types (kecuali define manual)
3. **No Migration Tool** - Harus manage migrations manual
4. **More Boilerplate** - Lebih banyak code untuk CRUD operations

## 📚 New Files Documentation

### 1. `/database/schema.sql`
File SQL untuk membuat semua tabel database. Includes:
- 11 tables lengkap dengan relationships
- Indexes untuk performance
- FULLTEXT index untuk search
- Foreign keys dengan CASCADE

### 2. `/database/seed.sql`
Data contoh untuk development:
- 8 Kategori berita
- 4 Statistik daerah
- 10 Tags
- 10 Settings
- 1 Admin user (default)

### 3. `/lib/db.ts`
MySQL2 connection pool dengan configuration:
- Connection pooling (max 10 connections)
- Keep-alive enabled
- Auto-reconnect on failure
- Connection testing on startup

### 4. `/lib/db-helpers.ts`
Helper functions untuk simplify database operations:
- `query()` - SELECT multiple rows
- `queryOne()` - SELECT single row
- `execute()` - INSERT/UPDATE/DELETE
- `transaction()` - Multiple queries in transaction
- `generateUUID()` - Generate UUID v4
- `buildWhereClause()` - Build WHERE from object
- `buildPagination()` - Build LIMIT/OFFSET
- Dan utility functions lainnya

### 5. `/lib/models/berita.ts`
Repository pattern untuk Berita model:
- `findAll()` - Get all dengan filters & pagination
- `findBySlug()` - Get by slug (published only)
- `findById()` - Get by ID
- `create()` - Create new berita
- `update()` - Update berita
- `delete()` - Delete berita
- `incrementViews()` - Increment view count
- `getPopular()` - Get popular berita
- `getRelated()` - Get related berita

## 🔧 Migration Steps untuk Existing Code

Jika ada code yang sudah menggunakan Prisma, berikut cara migrasi:

### Step 1: Update Imports
```typescript
// Before
import { prisma } from '@/lib/db'

// After
import { BeritaRepository } from '@/lib/models/berita'
// atau
import { query, queryOne, execute } from '@/lib/db-helpers'
```

### Step 2: Update Queries
```typescript
// Before
const berita = await prisma.berita.findMany()

// After
const result = await BeritaRepository.findAll()
const berita = result.data
```

### Step 3: Update Create/Update
```typescript
// Before
await prisma.berita.create({ data: {...} })

// After
await BeritaRepository.create({...})
```

## 📝 NPM Scripts Update

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "node scripts/migrate.js",  // Custom migration
    "db:seed": "node scripts/seed.js"         // Custom seeding
  }
}
```

## 🚀 Quick Start (Updated)

```bash
# 1. Install dependencies
npm install

# 2. Setup .env
cp .env.example .env
# Edit .env dengan DB credentials

# 3. Create database
mysql -u root -p
CREATE DATABASE merauke_portal;
EXIT;

# 4. Import schema
mysql -u root -p merauke_portal < database/schema.sql

# 5. Import seed (optional)
mysql -u root -p merauke_portal < database/seed.sql

# 6. Run development
npm run dev
```

## 📖 Documentation Files

1. **INSTALLATION_MYSQL2.md** - Panduan lengkap instalasi dengan mysql2
2. **database/schema.sql** - SQL schema lengkap
3. **database/seed.sql** - Seed data
4. **lib/db-helpers.ts** - Helper functions documentation (inline)
5. **lib/models/berita.ts** - Repository pattern example

## ⚡ Performance Notes

### Connection Pooling
```typescript
const pool = mysql.createPool({
  connectionLimit: 10,     // Max 10 concurrent connections
  waitForConnections: true, // Queue when pool is full
  queueLimit: 0,           // Unlimited queue
  enableKeepAlive: true    // Keep connections alive
})
```

### Prepared Statements
Semua queries menggunakan prepared statements untuk:
- ✅ SQL injection prevention
- ✅ Better performance (query caching)
- ✅ Automatic parameter escaping

### Indexes
Schema sudah include indexes untuk:
- Primary keys (id)
- Foreign keys (kategori_id, author_id)
- Slug columns
- Published status
- Timestamp columns
- FULLTEXT search (judul, excerpt, konten)

## 🔒 Security Notes

1. **SQL Injection Prevention**: Semua queries menggunakan prepared statements
2. **Connection Security**: Connection pool dengan proper error handling
3. **Password Hashing**: User passwords harus di-hash dengan bcrypt
4. **Input Validation**: Implement di API layer (belum included)
5. **Environment Variables**: Sensitive data di .env (never commit)

## 🎓 Learning Resources

- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [MySQL 8.0 Reference](https://dev.mysql.com/doc/refman/8.0/en/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

## 🆘 Need Help?

Jika ada pertanyaan tentang migration atau penggunaan mysql2:
1. Check INSTALLATION_MYSQL2.md
2. Review example di lib/models/berita.ts
3. Lihat inline documentation di lib/db-helpers.ts

---

**Migration Date**: November 28, 2024
**Status**: ✅ Complete
**Tested**: Development Environment
**Next**: Implement API endpoints dengan Repository pattern
