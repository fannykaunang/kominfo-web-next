#!/usr/bin/env node

/**
 * Auto Backup Cron Job Script
 * 
 * Script ini akan:
 * 1. Mengecek settings backup_auto dari database
 * 2. Menghitung apakah sudah waktunya backup berdasarkan backup_interval
 * 3. Menjalankan backup jika memenuhi syarat
 * 4. Update last_backup di database
 * 
 * Setup Cron Job:
 * - Jalankan setiap jam: 0 * * * * /path/to/node /path/to/auto-backup.js
 * - Jalankan setiap hari jam 2 pagi: 0 2 * * * /path/to/node /path/to/auto-backup.js
 */

const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Konfigurasi Database
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'izakod_asn',
  port: process.env.DB_PORT || 3306,
};

// Konfigurasi Backup
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const LOG_FILE = path.join(__dirname, 'auto-backup.log');

/**
 * Logger function
 */
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Error writing to log file:', error.message);
  }
}

/**
 * Get app settings from database
 */
async function getSettings(connection) {
  try {
    const [rows] = await connection.execute(
      'SELECT backup_auto, backup_interval, last_backup FROM app_settings WHERE id = 1 LIMIT 1'
    );
    
    if (rows.length === 0) {
      throw new Error('App settings not found in database');
    }
    
    return rows[0];
  } catch (error) {
    throw new Error(`Failed to get settings: ${error.message}`);
  }
}

/**
 * Check if backup should run
 */
function shouldRunBackup(settings) {
  // Check if auto backup is enabled
  if (!settings.backup_auto || settings.backup_auto !== 1) {
    log('Auto backup is disabled in settings', 'INFO');
    return false;
  }

  // If never backed up, should run
  if (!settings.last_backup) {
    log('No previous backup found, should run backup', 'INFO');
    return true;
  }

  // Calculate days since last backup
  const now = new Date();
  const lastBackup = new Date(settings.last_backup);
  const diffTime = now.getTime() - lastBackup.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  log(`Last backup: ${lastBackup.toISOString()}, Days elapsed: ${diffDays.toFixed(2)}, Interval: ${settings.backup_interval}`, 'INFO');

  // Check if interval has passed
  if (diffDays >= settings.backup_interval) {
    log('Backup interval has passed, should run backup', 'INFO');
    return true;
  }

  log('Backup interval has not passed yet', 'INFO');
  return false;
}

/**
 * Create backup directory if not exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    log(`Creating backup directory: ${BACKUP_DIR}`, 'INFO');
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Perform database backup using mysqldump
 */
function performBackup() {
  try {
    ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    log(`Starting backup to: ${filepath}`, 'INFO');

    // Build mysqldump command
    const command = `mysqldump -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${
      DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ''
    } ${DB_CONFIG.database} > ${filepath}`;

    // Execute mysqldump
    execSync(command, { stdio: 'inherit' });

    // Verify backup file exists and has content
    const stats = fs.statSync(filepath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }

    log(`Backup completed successfully: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'SUCCESS');
    
    // Compress backup (optional)
    try {
      execSync(`gzip ${filepath}`);
      log(`Backup compressed: ${filename}.gz`, 'INFO');
    } catch (error) {
      log(`Compression failed (non-critical): ${error.message}`, 'WARN');
    }

    return true;
  } catch (error) {
    log(`Backup failed: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Update last_backup timestamp in database
 */
async function updateLastBackup(connection) {
  try {
    await connection.execute(
      'UPDATE app_settings SET last_backup = NOW() WHERE id = 1'
    );
    log('Updated last_backup timestamp in database', 'SUCCESS');
  } catch (error) {
    log(`Failed to update last_backup: ${error.message}`, 'ERROR');
    throw error;
  }
}

/**
 * Create log entry in database
 */
async function createLogEntry(connection, message, success = true) {
  try {
    await connection.execute(
      `INSERT INTO log_aktivitas (
        user_id, aksi, modul, detail_aksi, endpoint, method, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        null, // system user
        'Backup',
        'Pengaturan',
        message,
        'auto-backup-cron',
        'SYSTEM'
      ]
    );
  } catch (error) {
    log(`Failed to create log entry: ${error.message}`, 'WARN');
  }
}

/**
 * Clean old backups (keep last N backups)
 */
function cleanOldBackups(keepCount = 10) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return;
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      log(`Cleaning ${filesToDelete.length} old backup(s)`, 'INFO');
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        log(`Deleted old backup: ${file.name}`, 'INFO');
      });
    }
  } catch (error) {
    log(`Failed to clean old backups: ${error.message}`, 'WARN');
  }
}

/**
 * Main function
 */
async function main() {
  let connection;
  
  try {
    log('========================================', 'INFO');
    log('Auto Backup Cron Job Started', 'INFO');
    log('========================================', 'INFO');

    // Create database connection
    log('Connecting to database...', 'INFO');
    connection = await mysql.createConnection(DB_CONFIG);
    log('Database connected successfully', 'SUCCESS');

    // Get settings
    const settings = await getSettings(connection);
    log(`Settings loaded - Auto: ${settings.backup_auto}, Interval: ${settings.backup_interval} days`, 'INFO');

    // Check if backup should run
    if (!shouldRunBackup(settings)) {
      log('Backup not needed at this time', 'INFO');
      await createLogEntry(connection, 'Auto backup check: Not needed yet', true);
      return;
    }

    // Perform backup
    log('Starting backup process...', 'INFO');
    const success = performBackup();

    if (success) {
      // Update last_backup timestamp
      await updateLastBackup(connection);
      
      // Create log entry
      await createLogEntry(connection, 'Auto backup completed successfully', true);
      
      // Clean old backups
      cleanOldBackups(10);
      
      log('Auto backup process completed successfully', 'SUCCESS');
    } else {
      await createLogEntry(connection, 'Auto backup failed', false);
      log('Auto backup process failed', 'ERROR');
      process.exit(1);
    }

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'ERROR');
    log(error.stack, 'ERROR');
    
    if (connection) {
      try {
        await createLogEntry(connection, `Auto backup error: ${error.message}`, false);
      } catch (logError) {
        log(`Failed to log error: ${logError.message}`, 'ERROR');
      }
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('Database connection closed', 'INFO');
    }
    log('========================================', 'INFO');
    log('Auto Backup Cron Job Finished', 'INFO');
    log('========================================', 'INFO');
  }
}

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});