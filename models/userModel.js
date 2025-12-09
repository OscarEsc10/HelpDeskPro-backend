import pool from '../config/connectionToPg.js';

class User {
  static async create({ email, passwordHash, name, role = 'client' }) {
    const query = `
      INSERT INTO users (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, created_at, updated_at;
    `;
    const values = [email, passwordHash, name, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, updates) {
    const { email, name, role } = updates;
    const query = `
      UPDATE users 
      SET email = $1, name = $2, role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, email, name, role, created_at, updated_at;
    `;
    const { rows } = await pool.query(query, [email, name, role, id]);
    return rows[0];
  }
}

export default User;