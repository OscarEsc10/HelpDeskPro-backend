import pg from 'pg';
import DATABASE_URL from './envConfig.js';

const { Pool, Client } = pg;

async function testConnection() {
  // Test with Pool
  console.log('Testing database connection with Pool...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    const poolResult = await pool.query('SELECT NOW()');
    console.log('Pool connection successful. Current time:', poolResult.rows[0].now);
  } catch (err) {
    console.error('Pool connection error:', err.message);
  } finally {
    await pool.end();
  }

  // Test with Client
  console.log('\nTesting database connection with Client...');
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    const clientResult = await client.query('SELECT NOW()');
    console.log('Client connection successful. Current time:', clientResult.rows[0].now);
  } catch (err) {
    console.error('Client connection error:', err.message);
  } finally {
    await client.end();
  }
}

testConnection()
  .then(() => console.log('\nConnection tests completed'))
  .catch(err => console.error('Test error:', err));
