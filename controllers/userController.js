import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

class UserController {
  static async register(req, res) {
    try {
      const { email, password, name, role = 'client' } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const user = await User.create({
        email,
        passwordHash,
        name,
        role
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Error registering user' });
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
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
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
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        updatedAt: user.updated_at
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Error updating profile' });
    }
  }
}

export default UserController;