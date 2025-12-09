import Ticket from '../models/ticketModel.js';
import Comment from '../models/commentModel.js';

class TicketController {
  static async createTicket(req, res) {
    try {
      const { title, description, priority = 'medium' } = req.body;
      
      const ticket = await Ticket.create({
        title,
        description,
        createdBy: req.user.id,
        priority
      });

      // TODO: Send email notification
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ error: 'Error creating ticket' });
    }
  }

  static async getTickets(req, res) {
    try {
      let tickets;
      const { status, priority } = req.query;
      
      if (req.user.role === 'client') {
        // Clients can only see their own tickets
        tickets = await Ticket.findByUser(req.user.id);
      } else {
        // Agents can see all tickets with optional filters
        const filters = {};
        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        
        tickets = await Ticket.findAll(filters);
      }
      
      res.json(tickets);
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({ error: 'Error fetching tickets' });
    }
  }

  static async getTicket(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findById(id);
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      // Check if user has permission to view this ticket
      if (req.user.role === 'client' && ticket.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to view this ticket' });
      }
      
      // Get comments for this ticket
      const comments = await Comment.findByTicket(id);
      
      res.json({
        ...ticket,
        comments
      });
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({ error: 'Error fetching ticket' });
    }
  }

  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Check if ticket exists and user has permission
      const existingTicket = await Ticket.findById(id);
      if (!existingTicket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      if (req.user.role === 'client' && existingTicket.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this ticket' });
      }
      
      // Only allow certain fields to be updated
      const allowedUpdates = {};
      if (updates.title) allowedUpdates.title = updates.title;
      if (updates.description) allowedUpdates.description = updates.description;
      
      // Only agents can update these fields
      if (req.user.role === 'agent') {
        if (updates.status) allowedUpdates.status = updates.status;
        if (updates.priority) allowedUpdates.priority = updates.priority;
        if (updates.assignedTo) allowedUpdates.assignedTo = updates.assignedTo;
      }
      
      const updatedTicket = await Ticket.update(id, allowedUpdates);
      
      // TODO: Send email notification if status changed
      
      res.json(updatedTicket);
    } catch (error) {
      console.error('Update ticket error:', error);
      res.status(500).json({ error: 'Error updating ticket' });
    }
  }

  static async addComment(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      
      // Check if ticket exists and user has permission
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      if (req.user.role === 'client' && ticket.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to comment on this ticket' });
      }
      
      const comment = await Comment.create({
        ticketId: id,
        authorId: req.user.id,
        message
      });
      
      // TODO: Send email notification about new comment
      
      res.status(201).json(comment);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: 'Error adding comment' });
    }
  }
}

export default TicketController;