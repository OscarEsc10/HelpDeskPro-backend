import Ticket from '../models/ticketModel.js';
import Comment from '../models/commentModel.js';

class TicketController {
  static async createTicket(req, res) {
    try {
      const { title, description, priority = 'medium' } = req.body;
      
      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: 'Title and description are required'
        });
      }
      
      // Validate priority
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid priority. Must be one of: low, medium, high'
        });
      }

      const ticket = await Ticket.create({
        title,
        description,
        createdBy: req.user.id,
        priority
      });

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating ticket',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getTickets(req, res) {
    try {
      const { status, priority, assignedTo, createdBy } = req.query;
      const filters = {};
      
      // Apply filters based on query parameters
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (assignedTo) filters.assignedTo = assignedTo;
      
      // Clients can only see their own tickets
      if (req.user.role === 'client') {
        filters.createdBy = req.user.id;
      } else if (createdBy) {
        // Agents can filter by created_by
        filters.createdBy = createdBy;
      }
      
      const tickets = await Ticket.findAll(filters);
      
      res.json({
        success: true,
        count: tickets.length,
        data: tickets
      });
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching tickets',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getTicket(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findById(id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
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
      res.status(500).json({ 
        success: false,
        error: 'Error updating ticket',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async addComment(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      
      // Check if ticket exists and user has permission
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ 
          success: false,
          error: 'Ticket not found' 
        });
      }
      
      if (req.user.role === 'client' && ticket.created_by !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to comment on this ticket' 
        });
      }
      
      const comment = await Comment.create({
        ticketId: id,
        authorId: req.user.id,
        message
      });
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error adding comment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Get the ticket first to check permissions
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      // Only the creator or an admin can delete the ticket
      if (userRole === 'client' && ticket.created_by !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this ticket'
        });
      }
      
      // Delete the ticket
      const deletedTicket = await Ticket.delete(id);
      
      res.json({
        success: true,
        message: 'Ticket deleted successfully',
        data: { id: deletedTicket.id }
      });
      
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting ticket',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async assignTicket(req, res) {
    try {
      const { id } = req.params;
      const { agentId } = req.body;
      
      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: 'agentId is required'
        });
      }
      
      // Check if ticket exists
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      // Assign ticket to agent
      const updatedTicket = await Ticket.assignTicket(id, agentId);
      
      res.json({
        success: true,
        message: 'Ticket assigned successfully',
        data: updatedTicket
      });
      
    } catch (error) {
      console.error('Assign ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Error assigning ticket',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getTicketStats(req, res) {
    try {
      const stats = await Ticket.getTicketStats();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Get ticket stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching ticket statistics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getAgentDashboard(req, res) {
    try {
      // Get ticket statistics
      const stats = await Ticket.getTicketStats();
      
      // Get recent tickets
      const recentTickets = await Ticket.findAll({
        limit: 5,
        sort: 'created_at:desc'
      });
      
      // Get assigned tickets for the current agent
      const myTickets = await Ticket.findAll({
        assignedTo: req.user.id,
        status: 'in_progress',
        limit: 5
      });
      
      res.json({
        success: true,
        data: {
          stats,
          recentTickets,
          myTickets
        }
      });
      
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Error loading dashboard',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default TicketController;