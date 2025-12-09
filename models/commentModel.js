import pool from '../config/connectionToPg.js';

class Comment {
  static async create({ ticketId, authorId, message }) {
    const query = `
      INSERT INTO comments (ticket_id, author_id, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [ticketId, authorId, message]);
    return rows[0];
  }

  static async findByTicket(ticketId) {
    const query = `
      SELECT c.*, u.name as author_name, u.role as author_role
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.ticket_id = $1
      ORDER BY c.created_at ASC;
    `;
    const { rows } = await pool.query(query, [ticketId]);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM comments WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, message) {
    const query = `
      UPDATE comments 
      SET message = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [message, id]);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

export default Comment;