const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let connection;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_lite',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const connectDatabase = async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Test the connection
    await connection.execute('SELECT 1');
    
    logger.info('MySQL Database connected successfully');
    return connection;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

const getConnection = () => {
  if (!connection) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return connection;
};

const executeQuery = async (query, params = []) => {
  try {
    const conn = getConnection();
    const [results] = await conn.execute(query, params);
    return results;
  } catch (error) {
    logger.error('Query execution failed:', { query, params, error: error.message });
    throw error;
  }
};

const executeTransaction = async (queries) => {
  const conn = getConnection();
  
  try {
    await conn.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await conn.execute(query, params);
      results.push(result);
    }
    
    await conn.commit();
    return results;
  } catch (error) {
    await conn.rollback();
    logger.error('Transaction failed:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  getConnection,
  executeQuery,
  executeTransaction
};