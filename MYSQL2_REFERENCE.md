# 🚀 Quick Reference - MySQL2 Usage

Panduan cepat menggunakan mysql2 dalam Portal Berita Kabupaten Merauke.

## 📚 Table of Contents

1. [Basic Queries](#basic-queries)
2. [Repository Pattern](#repository-pattern)
3. [Pagination](#pagination)
4. [Transactions](#transactions)
5. [Common Patterns](#common-patterns)
6. [Error Handling](#error-handling)

---

## Basic Queries

### SELECT Multiple Rows

```typescript
import { query } from '@/lib/db-helpers'

// Basic select
const users = await query('SELECT * FROM users')

// With WHERE
const admins = await query('SELECT * FROM users WHERE role = ?', ['ADMIN'])

// With multiple conditions
const publishedNews = await query(
  'SELECT * FROM berita WHERE is_published = ? AND kategori_id = ?',
  [true, kategoriId]
)

// With JOIN
const beritaWithKategori = await query(`
  SELECT 
    b.*,
    k.nama as kategori_nama,
    k.color as kategori_color
  FROM berita b
  INNER JOIN kategori k ON b.kategori_id = k.id
  WHERE b.is_published = 1
  ORDER BY b.created_at DESC
`)
```

### SELECT Single Row

```typescript
import { queryOne } from '@/lib/db-helpers'

// Get by ID
const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId])

// Get by slug
const berita = await queryOne('SELECT * FROM berita WHERE slug = ?', [slug])

// Returns null if not found
if (!berita) {
  // Handle not found
}
```

### INSERT

```typescript
import { execute, generateUUID } from '@/lib/db-helpers'

// Simple insert
const id = generateUUID()
const result = await execute(
  'INSERT INTO kategori (id, nama, slug, color) VALUES (?, ?, ?, ?)',
  [id, 'Pemerintahan', 'pemerintahan', '#3b82f6']
)

console.log(result.affectedRows) // 1
console.log(result.insertId) // Auto-increment ID (if any)

// Insert with JSON
const galeri = ['image1.jpg', 'image2.jpg']
await execute(
  'INSERT INTO berita (id, judul, slug, galeri, ...) VALUES (?, ?, ?, ?, ...)',
  [id, judul, slug, JSON.stringify(galeri)]
)
```

### UPDATE

```typescript
import { execute } from '@/lib/db-helpers'

// Update single column
const result = await execute(
  'UPDATE berita SET views = views + 1 WHERE id = ?',
  [beritaId]
)

// Update multiple columns
await execute(
  'UPDATE berita SET judul = ?, konten = ?, updated_at = NOW() WHERE id = ?',
  [newJudul, newKonten, beritaId]
)

console.log(result.affectedRows) // Number of rows updated
```

### DELETE

```typescript
import { execute } from '@/lib/db-helpers'

// Delete by ID
const result = await execute('DELETE FROM berita WHERE id = ?', [beritaId])

console.log(result.affectedRows) // Number of rows deleted

// Delete with condition
await execute('DELETE FROM komentar WHERE berita_id = ? AND is_approved = 0', [beritaId])
```

---

## Repository Pattern

### Using Berita Repository

```typescript
import { BeritaRepository } from '@/lib/models/berita'

// Get all with filters and pagination
const result = await BeritaRepository.findAll({
  page: 1,
  limit: 10,
  kategori_id: 'uuid-kategori',
  is_published: true,
  search: 'keyword'
})

console.log(result.data) // Array of berita
console.log(result.pagination) // { page, limit, total, totalPages }

// Get by slug
const berita = await BeritaRepository.findBySlug('judul-berita')

// Get by ID
const berita = await BeritaRepository.findById('uuid')

// Create
const newId = await BeritaRepository.create({
  judul: 'Judul Berita',
  slug: 'judul-berita',
  excerpt: 'Ringkasan berita...',
  konten: '<p>Konten lengkap...</p>',
  featured_image: '/images/featured.jpg',
  galeri: ['image1.jpg', 'image2.jpg'],
  kategori_id: 'uuid-kategori',
  author_id: 'uuid-author',
  is_published: true,
  published_at: new Date()
})

// Update
const updated = await BeritaRepository.update('uuid', {
  judul: 'Judul Updated',
  konten: 'Konten updated...'
})

// Delete
const deleted = await BeritaRepository.delete('uuid')

// Increment views
await BeritaRepository.incrementViews('uuid')

// Get popular berita
const popular = await BeritaRepository.getPopular(5)

// Get related berita
const related = await BeritaRepository.getRelated(kategoriId, currentBeritaId, 3)
```

### Creating Custom Repository

```typescript
// lib/models/kategori.ts
import { query, queryOne, execute, generateUUID } from '@/lib/db-helpers'

export class KategoriRepository {
  static async findAll() {
    return await query(`
      SELECT 
        k.*,
        COUNT(b.id) as berita_count
      FROM kategori k
      LEFT JOIN berita b ON k.id = b.kategori_id AND b.is_published = 1
      GROUP BY k.id
      ORDER BY k.nama ASC
    `)
  }

  static async findBySlug(slug: string) {
    return await queryOne(
      'SELECT * FROM kategori WHERE slug = ?',
      [slug]
    )
  }

  static async create(data: { nama: string; slug: string; color: string; icon?: string }) {
    const id = generateUUID()
    await execute(
      'INSERT INTO kategori (id, nama, slug, color, icon) VALUES (?, ?, ?, ?, ?)',
      [id, data.nama, data.slug, data.color, data.icon || null]
    )
    return id
  }

  static async update(id: string, data: Partial<{ nama: string; slug: string; color: string }>) {
    const updates: string[] = []
    const params: any[] = []

    if (data.nama) {
      updates.push('nama = ?')
      params.push(data.nama)
    }
    if (data.slug) {
      updates.push('slug = ?')
      params.push(data.slug)
    }
    if (data.color) {
      updates.push('color = ?')
      params.push(data.color)
    }

    if (updates.length === 0) return false

    params.push(id)
    const result = await execute(
      `UPDATE kategori SET ${updates.join(', ')} WHERE id = ?`,
      params
    )
    return result.affectedRows > 0
  }

  static async delete(id: string) {
    const result = await execute('DELETE FROM kategori WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}
```

---

## Pagination

### Building Pagination Manually

```typescript
import { query, buildPagination } from '@/lib/db-helpers'

const page = 1
const limit = 10

const { offset, limitClause } = buildPagination(page, limit)

// Get data
const data = await query(`
  SELECT * FROM berita 
  WHERE is_published = 1 
  ORDER BY created_at DESC
  ${limitClause}
`)

// Get total count
const [{ total }] = await query('SELECT COUNT(*) as total FROM berita WHERE is_published = 1')

const pagination = {
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1
}

return { data, pagination }
```

### Complete Pagination Helper

```typescript
export async function getPaginatedResults<T>(
  tableName: string,
  options: {
    page?: number
    limit?: number
    where?: string
    params?: any[]
    orderBy?: string
  } = {}
) {
  const { page = 1, limit = 10, where = '', params = [], orderBy = 'created_at DESC' } = options
  
  const { limitClause } = buildPagination(page, limit)
  const whereClause = where ? `WHERE ${where}` : ''

  // Get data
  const dataSql = `
    SELECT * FROM ${tableName}
    ${whereClause}
    ORDER BY ${orderBy}
    ${limitClause}
  `
  const data = await query<T>(dataSql, params)

  // Get total
  const countSql = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`
  const [{ total }] = await query<any>(countSql, params)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Usage
const result = await getPaginatedResults('berita', {
  page: 1,
  limit: 10,
  where: 'is_published = ? AND kategori_id = ?',
  params: [true, kategoriId],
  orderBy: 'published_at DESC'
})
```

---

## Transactions

### Simple Transaction

```typescript
import { transaction } from '@/lib/db-helpers'

await transaction([
  {
    query: 'INSERT INTO berita (id, judul, ...) VALUES (?, ?, ...)',
    params: [id, judul, ...]
  },
  {
    query: 'INSERT INTO berita_tags (berita_id, tag_id) VALUES (?, ?)',
    params: [beritaId, tagId]
  }
])
```

### Complex Transaction

```typescript
import pool from '@/lib/db'

const connection = await pool.getConnection()

try {
  await connection.beginTransaction()

  // Insert berita
  const [beritaResult] = await connection.execute(
    'INSERT INTO berita (...) VALUES (...)',
    [...]
  )
  const beritaId = beritaResult.insertId

  // Insert tags
  for (const tagId of tagIds) {
    await connection.execute(
      'INSERT INTO berita_tags (berita_id, tag_id) VALUES (?, ?)',
      [beritaId, tagId]
    )
  }

  // Update statistik
  await connection.execute(
    'UPDATE statistik SET nilai = nilai + 1 WHERE judul = ?',
    ['Total Berita']
  )

  await connection.commit()
  return beritaId
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  connection.release()
}
```

---

## Common Patterns

### Search with LIKE

```typescript
import { query, escapeLike } from '@/lib/db-helpers'

const searchTerm = escapeLike(userInput)

const results = await query(
  'SELECT * FROM berita WHERE judul LIKE ? OR excerpt LIKE ?',
  [`%${searchTerm}%`, `%${searchTerm}%`]
)
```

### FULLTEXT Search

```typescript
// Using FULLTEXT index (already created in schema)
const results = await query(`
  SELECT *,
    MATCH(judul, excerpt, konten) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
  FROM berita
  WHERE MATCH(judul, excerpt, konten) AGAINST(? IN NATURAL LANGUAGE MODE)
  ORDER BY relevance DESC
  LIMIT 20
`, [searchTerm, searchTerm])
```

### Dynamic WHERE Clause

```typescript
import { buildWhereClause } from '@/lib/db-helpers'

const filters = {
  kategori_id: 'uuid',
  is_published: true,
  // author_id: undefined (will be ignored)
}

const { whereClause, values } = buildWhereClause(filters)
// whereClause: "WHERE kategori_id = ? AND is_published = ?"
// values: ['uuid', true]

const results = await query(
  `SELECT * FROM berita ${whereClause} ORDER BY created_at DESC`,
  values
)
```

### JSON Fields

```typescript
// Storing JSON
const galeri = ['image1.jpg', 'image2.jpg', 'image3.jpg']
await execute(
  'INSERT INTO berita (id, judul, galeri) VALUES (?, ?, ?)',
  [id, judul, JSON.stringify(galeri)]
)

// Reading JSON
const berita = await queryOne('SELECT * FROM berita WHERE id = ?', [id])
const galeriArray = berita.galeri ? JSON.parse(berita.galeri) : []
```

### Exists Check

```typescript
// Check if exists
const [{ count }] = await query(
  'SELECT COUNT(*) as count FROM berita WHERE slug = ?',
  [slug]
)
const exists = count > 0

// Or using EXISTS
const [{ exists }] = await query(
  'SELECT EXISTS(SELECT 1 FROM berita WHERE slug = ?) as `exists`',
  [slug]
)
```

---

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const berita = await BeritaRepository.findBySlug(slug)
  
  if (!berita) {
    return { error: 'Berita not found', status: 404 }
  }
  
  return { data: berita }
} catch (error) {
  console.error('Database error:', error)
  return { error: 'Internal server error', status: 500 }
}
```

### API Route Example

```typescript
// app/api/berita/[slug]/route.ts
import { NextResponse } from 'next/server'
import { BeritaRepository } from '@/lib/models/berita'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const berita = await BeritaRepository.findBySlug(params.slug)
    
    if (!berita) {
      return NextResponse.json(
        { error: 'Berita not found' },
        { status: 404 }
      )
    }

    // Increment views
    await BeritaRepository.incrementViews(berita.id)
    
    return NextResponse.json({ data: berita })
  } catch (error) {
    console.error('Error fetching berita:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Validation

```typescript
// Simple validation helper
function validateBeritaInput(data: any) {
  const errors: string[] = []

  if (!data.judul || data.judul.length < 10) {
    errors.push('Judul must be at least 10 characters')
  }
  
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens')
  }

  if (!data.konten || data.konten.length < 100) {
    errors.push('Konten must be at least 100 characters')
  }

  if (!data.kategori_id) {
    errors.push('Kategori is required')
  }

  return errors
}

// Usage
const errors = validateBeritaInput(formData)
if (errors.length > 0) {
  return { error: errors.join(', '), status: 400 }
}
```

---

## Best Practices

### ✅ DO

- Use prepared statements (always with `?` placeholders)
- Use transactions for multiple related operations
- Handle errors properly with try-catch
- Validate input before database operations
- Use connection pooling (already configured)
- Close/release connections after use
- Use indexes for frequently queried columns
- Limit result sets with LIMIT
- Use specific column names instead of SELECT *

### ❌ DON'T

- Concatenate user input directly into SQL (SQL injection!)
- Forget to handle null values
- Use synchronous mysql methods
- Keep connections open indefinitely
- Fetch large datasets without pagination
- Store sensitive data without encryption
- Forget to validate and sanitize input

---

## Debugging Tips

### Log Queries

```typescript
// In development, log queries
const DEBUG = process.env.NODE_ENV === 'development'

export async function query(sql: string, params?: any[]) {
  if (DEBUG) {
    console.log('SQL:', sql)
    console.log('Params:', params)
  }
  
  const [rows] = await pool.execute(sql, params)
  
  if (DEBUG) {
    console.log('Results:', rows.length, 'rows')
  }
  
  return rows
}
```

### EXPLAIN Queries

```typescript
// Analyze query performance
const explain = await query(`EXPLAIN ${yourQuery}`, params)
console.table(explain)
```

---

**Last Updated**: November 2024  
**More Info**: See `INSTALLATION_MYSQL2.md` and `lib/models/berita.ts`
