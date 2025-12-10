import { Router } from 'express';
import UserController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', UserController.login);
router.post('/', UserController.createUser);

// Protected routes
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);

// Admin routes
router.get('/:id', authenticate, authorize(['agent']), UserController.getUserById);
router.delete('/:id', authenticate, authorize(['agent']), UserController.deleteUser);

export default router;