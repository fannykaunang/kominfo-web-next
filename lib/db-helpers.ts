import pool from './db'
import { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise'

/**
 * Execute a SELECT query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Array of results
 */
export async function query<T extends RowDataPacket>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await pool.execute<T[]>(query, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Execute a single SELECT query and return first result
 * @param query SQL query string
 * @param params Query parameters
 * @returns Single result or null
 */
export async function queryOne<T extends RowDataPacket>(
  query: string,
  params?: any[]
): Promise<T | null> {
  try {
    const [rows] = await pool.execute<T[]>(query, params)
    return rows[0] || null
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Execute an INSERT, UPDATE, or DELETE query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Result with affectedRows, insertId, etc.
 */
export async function execute(
  query: string,
  params?: any[]
): Promise<ResultSetHeader> {
  try {
    const [result] = await pool.execute<ResultSetHeader>(query, params)
    return result
  } catch (error) {
    console.error('Database execute error:', error)
    throw error
  }
}

/**
 * Execute multiple queries in a transaction
 * @param queries Array of {query, params}
 * @returns Array of results
 */
export async function transaction(
  queries: { query: string; params?: any[] }[]
): Promise<any[]> {
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    const results = []
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params)
      results.push(result)
    }
    
    await connection.commit()
    return results
  } catch (error) {
    await connection.rollback()
    console.error('Transaction error:', error)
    throw error
  } finally {
    connection.release()
  }
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Build WHERE clause from filters
 * @param filters Object with column: value pairs
 * @returns {whereClause, values}
 */
export function buildWhereClause(filters: Record<string, any>) {
  const conditions: string[] = []
  const values: any[] = []

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = ?`)
      values.push(value)
    }
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : ''

  return { whereClause, values }
}

/**
 * Build pagination clause
 * @param page Page number (1-indexed)
 * @param limit Items per page
 * @returns {offset, limitClause}
 */
export function buildPagination(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit
  const limitClause = `LIMIT ${limit} OFFSET ${offset}`
  
  return { offset, limit, limitClause }
}

/**
 * Escape LIKE pattern
 */
export function escapeLike(value: string): string {
  return value.replace(/[%_]/g, '\\$&')
}

/**
 * Format date for MySQL
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

// Export pool for advanced usage
export { pool }
