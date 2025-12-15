import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import pool from '../config/connectionToPg.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

class UserController {
  static async createUser(req, res) {
    try {
      const { email, password, name, role = 'client' } = req.body;

      // Validate role against the ENUM
      if (!['client', 'agent'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be either client or agent' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user with database column names
      const user = await User.create({
        email,
        passwordHash, // matches the parameter name in User.create()
        name,
        role,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Generate JWT with 7 days expiration
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Also store the token in auth_sessions
      await User.storeAuthSession(user.id, token);

      // Return user data (excluding sensitive information)
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: user.created_at
        },
        token
      });
    } catch (error) {
      console.error('Create user error:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Error creating user', details: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error logging in' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        success: true,
        message: 'User profile retrieved successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Error fetching profile' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const updates = req.body;
      const user = await User.update(req.user.id, updates);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          updatedAt: user.updated_at
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Error updating profile' });
    }
  }

  // Get user by ID (admin only)
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error retrieving user' 
      });
    }
  }

  // Delete user (admin only or user deleting their own account)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.id;
      const requestingUserRole = req.user.role;

      // Only allow admins to delete other users or users to delete themselves
      if (requestingUserRole !== 'agent' && requestingUserId.toString() !== id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to perform this action'
        });
      }

      const deletedUser = await User.delete(id);
      
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
        userId: deletedUser.id,
        email: deletedUser.email
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting user'
      });
    }
  }
  // Get all users (admin/agent only)
  static async getAllUsers(req, res) {
    try {
      const query = 'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC';
      const { rows } = await pool.query(query);
      
      res.json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching users',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default UserController;