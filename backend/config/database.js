const mysql = require('mysql2/promise');
const config = require('./environment');
const path = require('path');
const fs = require('fs');

let pool = null;
let activeEngine = 'none';

// SQLite fallback adapter mimicking mysql2/promise API
function createSqliteAdapter() {
  const sqlite3 = require('sqlite3').verbose();
  const isVercel = Boolean(process.env.VERCEL);
  const dbDir = isVercel ? '/tmp' : path.join(__dirname, '..', 'database');
  const dbPath = path.join(dbDir, 'hospital_local.sqlite');

  // On Vercel serverless, copy pre-seeded database to writable /tmp if not present
  if (isVercel && !fs.existsSync(dbPath)) {
    const sourceDb = path.join(__dirname, '..', 'database', 'hospital_local.sqlite');
    if (fs.existsSync(sourceDb)) {
      try {
        fs.copyFileSync(sourceDb, dbPath);
      } catch (e) {
        console.warn('Could not copy sqlite to /tmp:', e.message);
      }
    }
  }

  const db = new sqlite3.Database(dbPath);

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const trimmed = sql.trim().toLowerCase();
      // Clean MySQL specific keywords that SQLite doesn't recognize
      let cleanedSql = sql
        .replace(/ENGINE\s*=\s*InnoDB/gi, '')
        .replace(/DEFAULT\s+CHARSET\s*=\s*utf8mb4/gi, '')
        .replace(/COLLATE\s*=\s*utf8mb4_unicode_ci/gi, '')
        .replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '')
        .replace(/FOR\s+UPDATE/gi, '');

      if (trimmed.startsWith('select') || trimmed.startsWith('show') || trimmed.startsWith('pragma')) {
        db.all(cleanedSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve([rows || [], []]);
        });
      } else {
        db.run(cleanedSql, params, function(err) {
          if (err) return reject(err);
          const result = {
            insertId: this.lastID,
            affectedRows: this.changes,
            changedRows: this.changes
          };
          resolve([result, []]);
        });
      }
    });
  };

  // Async mutex for transaction serialization in SQLite local adapter
  let txLock = Promise.resolve();

  const adapter = {
    async query(sql, params = []) {
      return executeQuery(sql, params);
    },
    async execute(sql, params = []) {
      return executeQuery(sql, params);
    },
    async getConnection() {
      let inTransaction = false;
      let releaseLock = null;

      return {
        async query(sql, params = []) {
          return executeQuery(sql, params);
        },
        async execute(sql, params = []) {
          return executeQuery(sql, params);
        },
        async beginTransaction() {
          // Wait for any existing transaction to complete
          await txLock;
          let unlock;
          txLock = new Promise((resolve) => {
            unlock = resolve;
          });
          releaseLock = unlock;
          inTransaction = true;
          return executeQuery('BEGIN TRANSACTION');
        },
        async commit() {
          if (inTransaction) {
            inTransaction = false;
            try {
              return await executeQuery('COMMIT');
            } finally {
              if (releaseLock) {
                releaseLock();
                releaseLock = null;
              }
            }
          }
        },
        async rollback() {
          if (inTransaction) {
            inTransaction = false;
            try {
              return await executeQuery('ROLLBACK');
            } finally {
              if (releaseLock) {
                releaseLock();
                releaseLock = null;
              }
            }
          }
        },
        release() {
          if (inTransaction && releaseLock) {
            inTransaction = false;
            executeQuery('ROLLBACK').catch(() => {});
            releaseLock();
            releaseLock = null;
          }
        }
      };
    },
    async end() {
      return new Promise((res) => db.close(res));
    }
  };

  return adapter;
}

async function initDatabase() {
  if (pool) return pool;

  if (config.db.driver === 'mysql' || config.db.driver === 'auto') {
    try {
      const mysqlPool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        waitForConnections: true,
        connectionLimit: config.db.connectionLimit,
        queueLimit: 0,
        connectTimeout: 2000
      });

      // Test connection
      const [testRows] = await mysqlPool.query('SELECT 1 + 1 AS test');
      console.log('✅ Connected to MySQL Database successfully at', `${config.db.host}:${config.db.port}/${config.db.database}`);
      pool = mysqlPool;
      activeEngine = 'mysql';
      return pool;
    } catch (err) {
      if (config.db.driver === 'mysql') {
        console.error('❌ Failed to connect to MySQL:', err.message);
        throw err;
      }
      console.warn('⚠️  MySQL not reachable at port 3306; initializing zero-config local storage adapter for immediate offline development.');
    }
  }

  // Fallback to SQLite adapter
  pool = createSqliteAdapter();
  activeEngine = 'sqlite';
  console.log('✅ Local Database Adapter initialized.');
  return pool;
}

// Proxied exported pool object for lazy init
const dbProxy = {
  async query(sql, params) {
    if (!pool) await initDatabase();
    return pool.query(sql, params);
  },
  async execute(sql, params) {
    if (!pool) await initDatabase();
    return pool.execute(sql, params);
  },
  async getConnection() {
    if (!pool) await initDatabase();
    return pool.getConnection();
  },
  getActiveEngine() {
    return activeEngine;
  },
  initDatabase
};

module.exports = dbProxy;
