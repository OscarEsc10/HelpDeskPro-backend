import { Router } from 'express';
import TicketController from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Ticket CRUD routes
router.post('/', TicketController.createTicket);
router.get('/', TicketController.getTickets);
router.get('/:id', TicketController.getTicket);
router.put('/:id', TicketController.updateTicket);
router.delete('/:id', TicketController.deleteTicket);

// Comment routes
router.post('/:id/comments', TicketController.addComment);

// Agent-only routes
const agentOnly = authorize(['agent']);

// Assign ticket to agent
router.post('/:id/assign', agentOnly, TicketController.assignTicket);

// Get ticket statistics
router.get('/stats/summary', agentOnly, TicketController.getTicketStats);

// Agent dashboard
router.get('/agent/dashboard', agentOnly, TicketController.getAgentDashboard);

// Export the router
export default router;