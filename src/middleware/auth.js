// backend/src/middleware/auth.js - Fixed version
import jwt from 'jsonwebtoken';
import prisma from '../database/connection.js';

// Single declaration of authenticateToken
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true
      }
    });

    // Map Prisma field names to expected field names for backward compatibility
    if (user) {
      user.is_verified = user.isVerified;
      user.is_active = user.isActive;
      delete user.isVerified;
      delete user.isActive;
    }

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if user has an active premium subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: decoded.userId,
        status: 'active',
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const hasPremium = subscription && ['premium', 'vip'].includes(subscription.plan);

    req.user = {
      ...user,
      hasPremium: !!hasPremium,
      subscription: subscription || null
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true
      }
    });

    // Map Prisma field names to expected field names
    if (user) {
      user.is_verified = user.isVerified;
      user.is_active = user.isActive;
      delete user.isVerified;
      delete user.isActive;
    }

    if (user && user.is_active) {
      // Check if user has an active premium subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: decoded.userId,
          status: 'active',
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const hasPremium = subscription && ['premium', 'vip'].includes(subscription.plan);

      req.user = {
        ...user,
        hasPremium: !!hasPremium,
        subscription: subscription || null
      };
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }

  next();
};

export const requireProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user has completed basic profile
  if (!req.user.name || !req.user.age || !req.user.bio) {
    return res.status(403).json({
      success: false,
      message: 'Profile completion required'
    });
  }

  next();
};