import { Router } from 'express';
import TicketController from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Ticket routes
router.post('/', TicketController.createTicket);
router.get('/', TicketController.getTickets);
router.get('/:id', TicketController.getTicket);
router.put('/:id', TicketController.updateTicket);

// Comment routes
router.post('/:id/comments', TicketController.addComment);

// Only agents can access these routes
const agentOnly = authorize(['agent']);
router.get('/agent/dashboard', agentOnly, (req, res) => {
  // This would be a more complex dashboard in a real app
  res.json({ message: 'Agent dashboard' });
});

export default router;