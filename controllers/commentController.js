import Comment from '../models/commentModel.js';
import Ticket from '../models/ticketModel.js';

class CommentController {
  // Add a comment to a ticket
  static async addComment(req, res) {
    try {
      const { id: ticketId } = req.params;
      const { message } = req.body;
      const userId = req.user.id;

      // Check if ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Check if user has permission to comment on this ticket
      if (req.user.role === 'client' && ticket.created_by !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to comment on this ticket'
        });
      }

      const comment = await Comment.create({
        ticketId,
        authorId: userId,
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

  // Get all comments for a ticket
  static async getComments(req, res) {
    try {
      const { id: ticketId } = req.params;
      
      // Check if ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Check if user has permission to view comments
      if (req.user.role === 'client' && ticket.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view comments for this ticket'
        });
      }

      const comments = await Comment.findByTicket(ticketId);
      
      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching comments',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update a comment
  static async updateComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const { message } = req.body;
      const userId = req.user.id;

      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }

      // Check if the comment belongs to the ticket
      if (comment.ticket_id.toString() !== id) {
        return res.status(400).json({
          success: false,
          error: 'Comment does not belong to this ticket'
        });
      }

      // Check if user is the author of the comment
      if (comment.author_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this comment'
        });
      }

      const updatedComment = await Comment.update(commentId, message);
      
      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating comment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete a comment
  static async deleteComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const userId = req.user.id;

      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }

      // Check if the comment belongs to the ticket
      if (comment.ticket_id.toString() !== id) {
        return res.status(400).json({
          success: false,
          error: 'Comment does not belong to this ticket'
        });
      }

      // Check if user is the author of the comment or an admin
      if (comment.author_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this comment'
        });
      }

      await Comment.delete(commentId);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully',
        data: { id: commentId }
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting comment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default CommentController;