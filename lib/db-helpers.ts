import mysql from "mysql2/promise";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3307"),
  user: process.env.DB_USER || "root80",
  password: process.env.DB_PASSWORD || "localhost@fanny87",
  database: process.env.DB_NAME || "kominfo_web",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Execute a SELECT query (generic)
 * @param query SQL query string
 * @param params Query parameters
 * @returns Array of results sebagai T[]
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    console.log("🔍 DB Query:", sql);
    console.log("📋 Params before sanitize:", params);

    // Handle params properly
    let sanitizedParams: any[] | undefined;
    if (params === undefined || params === null) {
      sanitizedParams = undefined;
    } else if (Array.isArray(params)) {
      sanitizedParams = params.map((p) => (p === undefined ? null : p));
    } else {
      sanitizedParams = undefined;
    }

    console.log("✅ Params after sanitize:", sanitizedParams);

    const [rows] = await pool.execute<RowDataPacket[]>(
      sql,
      sanitizedParams || []
    );
    return rows as T[];
  } catch (error) {
    console.error("❌ Database query error:", error);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw error;
  }
}

/**
 * Execute a single SELECT query and return first result
 * @param query SQL query string
 * @param params Query parameters
 * @returns Single result or null
 */
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  try {
    console.log("🔍 DB QueryOne:", sql);
    console.log("📋 Params before sanitize:", params);

    // Handle params properly
    let sanitizedParams: any[] | undefined;
    if (params === undefined || params === null) {
      sanitizedParams = undefined;
    } else if (Array.isArray(params)) {
      sanitizedParams = params.map((p) => (p === undefined ? null : p));
    } else {
      sanitizedParams = undefined;
    }

    console.log("✅ Params after sanitize:", sanitizedParams);

    const [rows] = await pool.execute<RowDataPacket[]>(
      sql,
      sanitizedParams || []
    );
    const typedRows = rows as T[];
    return typedRows[0] || null;
  } catch (error) {
    console.error("❌ Database query error:", error);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw error;
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
    console.log("🔍 DB Execute:", query);
    console.log("📋 Params before sanitize:", params);

    // Handle params properly
    let sanitizedParams: any[] | undefined;
    if (params === undefined || params === null) {
      sanitizedParams = undefined;
    } else if (Array.isArray(params)) {
      sanitizedParams = params.map((p) => (p === undefined ? null : p));
    } else {
      sanitizedParams = undefined;
    }

    console.log("✅ Params after sanitize:", sanitizedParams);

    const [result] = await pool.execute<ResultSetHeader>(
      query,
      sanitizedParams || []
    );
    return result;
  } catch (error) {
    console.error("❌ Database execute error:", error);
    console.error("SQL:", query);
    console.error("Params:", params);
    throw error;
  }
}

/**
 * Khusus INSERT: langsung balikin insertId sebagai number
 */
export async function executeInsert(
  query: string,
  params?: any[]
): Promise<number> {
  try {
    console.log("🔍 DB ExecuteInsert:", query);
    console.log("📋 Params before sanitize:", params);

    // Handle params properly
    let sanitizedParams: any[] | undefined;
    if (params === undefined || params === null) {
      sanitizedParams = undefined;
    } else if (Array.isArray(params)) {
      sanitizedParams = params.map((p) => (p === undefined ? null : p));
    } else {
      sanitizedParams = undefined;
    }

    console.log("✅ Params after sanitize:", sanitizedParams);

    const [result] = await pool.execute<ResultSetHeader>(
      query,
      sanitizedParams || []
    );
    return result.insertId;
  } catch (error) {
    console.error("❌ Database insert error:", error);
    console.error("SQL:", query);
    console.error("Params:", params);
    throw error;
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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const results: any[] = [];
    for (const { query, params } of queries) {
      console.log("🔍 Transaction Query:", query);
      console.log("📋 Transaction Params:", params);

      // Handle params properly
      let sanitizedParams: any[] | undefined;
      if (params === undefined || params === null) {
        sanitizedParams = undefined;
      } else if (Array.isArray(params)) {
        sanitizedParams = params.map((p) => (p === undefined ? null : p));
      } else {
        sanitizedParams = undefined;
      }

      const [result] = await connection.execute(query, sanitizedParams || []);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error("❌ Transaction error:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Generate UUID v4 (for primary keys)
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Build pagination clauses
 */
export function buildPagination(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  return {
    limitClause: `LIMIT ${limit} OFFSET ${offset}`,
    offset,
    limit,
  };
}

export default pool;
