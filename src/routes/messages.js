import express from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send a message
router.post('/', authenticateToken, [
  body('receiverId').isUUID(),
  body('content').trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    // Check if trying to message self
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    // Check if receiver exists and is active
    const receiver = await prisma.user.findFirst({
      where: {
        id: receiverId,
        isActive: true
      },
      select: { id: true }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if there's an accepted match between users
    const match = await prisma.match.findFirst({
      where: {
        status: 'accepted',
        OR: [
          {
            userInitiatorId: senderId,
            userReceiverId: receiverId
          },
          {
            userInitiatorId: receiverId,
            userReceiverId: senderId
          }
        ]
      }
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'Can only message accepted matches'
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Get conversation with a specific user
router.get('/conversation/:userId', authenticateToken, [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const currentUserId = req.user.id;
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if there's an accepted match
    const match = await prisma.match.findFirst({
      where: {
        status: 'accepted',
        OR: [
          {
            userInitiatorId: currentUserId,
            userReceiverId: userId
          },
          {
            userInitiatorId: userId,
            userReceiverId: currentUserId
          }
        ]
      }
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'Can only view conversations with accepted matches'
      });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: userId
          },
          {
            senderId: userId,
            receiverId: currentUserId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        receiverId: currentUserId,
        senderId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: messages.length
        }
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all accepted matches
    const matches = await prisma.match.findMany({
      where: {
        status: 'accepted',
        OR: [
          { userInitiatorId: currentUserId },
          { userReceiverId: currentUserId }
        ]
      }
    });

    // Get latest message for each conversation
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.userInitiatorId === currentUserId ? match.userReceiverId : match.userInitiatorId;
        
        // Get other user's info
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true
          }
        });

        // Get latest message
        const latestMessage = await prisma.message.findFirst({
          where: {
            OR: [
              {
                senderId: currentUserId,
                receiverId: otherUserId
              },
              {
                senderId: otherUserId,
                receiverId: currentUserId
              }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Get unread count
        const unreadCount = await prisma.message.count({
          where: {
            receiverId: currentUserId,
            senderId: otherUserId,
            isRead: false
          }
        });

        return {
          match,
          user: otherUser,
          latestMessage,
          unreadCount
        };
      })
    );

    // Sort by latest message time
    conversations.sort((a, b) => {
      if (!a.latestMessage && !b.latestMessage) return 0;
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
    });

    res.json({
      success: true,
      data: {
        conversations
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Mark messages as read
router.put('/read/:senderId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { senderId } = req.params;

    // Check if there's an accepted match
    const match = await prisma.match.findFirst({
      where: {
        status: 'accepted',
        OR: [
          {
            userInitiatorId: currentUserId,
            userReceiverId: senderId
          },
          {
            userInitiatorId: senderId,
            userReceiverId: currentUserId
          }
        ]
      }
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'Can only mark messages as read from accepted matches'
      });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        receiverId: currentUserId,
        senderId: senderId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: currentUserId,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

// Delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Check if message exists and user is the sender
    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: currentUserId
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not the sender'
      });
    }

    // Delete message
    await prisma.message.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

export default router; 