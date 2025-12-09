import pg from 'pg';
import { DATABASE_URL } from './envConfig.js';

const { Pool } = pg;

console.log('🔌 Connecting to the database...');

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Test the connection when this module is imported
(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database');
    
    // Log database server version
    const result = await client.query('SELECT version()');
    console.log(`📊 Database version: ${result.rows[0].version.split(' ').slice(0, 3).join(' ')}`);
    
    client.release();
  } catch (error) {
    console.error(' Error connecting to the database:', error.message);
    console.log('💡 Make sure your database is running and the connection string is correct');
  }
})();

export default pool;
