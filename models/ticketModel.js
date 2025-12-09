import pool from '../config/connectionToPg.js';

class Ticket {
  static async create({ title, description, createdBy, priority = 'medium' }) {
    const query = `
      INSERT INTO tickets (title, description, created_by, priority, status)
      VALUES ($1, $2, $3, $4, 'open')
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [title, description, createdBy, priority]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM tickets WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByUser(userId) {
    const query = 'SELECT * FROM tickets WHERE created_by = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM tickets';
    const values = [];
    const conditions = [];
    
    if (filters.status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(filters.status);
    }
    
    if (filters.priority) {
      conditions.push(`priority = $${values.length + 1}`);
      values.push(filters.priority);
    }
    
    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${values.length + 1}`);
      values.push(filters.assignedTo);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async update(id, updates) {
    const { title, description, status, priority, assignedTo } = updates;
    const query = `
      UPDATE tickets 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      title, 
      description, 
      status, 
      priority, 
      assignedTo || null, 
      id
    ]);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM tickets WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

export default Ticket;