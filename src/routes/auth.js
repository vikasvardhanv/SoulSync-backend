// backend/src/routes/auth.js (Complete enhanced version)
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import EmailService from '../services/emailService.js';
import { authLogger, dbLogger } from '../middleware/logger.js';

const router = express.Router();

// Enhanced validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, apostrophes, and hyphens'),
  body('age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('gender')
    .isIn(['male','female','non-binary','other','prefer-not-to-say'])
    .withMessage('Please select a valid gender'),
  body('lookingFor')
    .isIn(['male','female','non-binary','everyone'])
    .withMessage('Please select who you are looking for'),
  body('minAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Minimum age must be between 18 and 100'),
  body('maxAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Maximum age must be between 18 and 100'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('interests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 interests allowed'),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters'),
  body('photos')
    .optional()
    .isArray({ max: 6 })
    .withMessage('Maximum 6 photos allowed'),
  body('photos.*')
    .optional()
    .custom((value) => {
      // Allow regular URLs or data URLs (for base64 images)
      if (typeof value !== 'string') {
        throw new Error('Photo must be a string');
      }
      
      // Check if it's a data URL (base64)
      if (value.startsWith('data:image/')) {
        // Validate base64 image size (estimate)
        const base64Length = value.length;
        const sizeInBytes = (base64Length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 2) {
          throw new Error(`Photo too large (${sizeInMB.toFixed(1)}MB). Please compress images to under 2MB each. Tip: Use lower resolution or compress before uploading.`);
        }
        
        return true;
      }
      
      // Check if it's a regular URL
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Each photo must be a valid URL or data URL');
      }
    })
    .withMessage('Each photo must be a valid URL or data URL')
];

// Generate JWT tokens
const generateTokens = (userId) => {
  try {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication tokens');
  }
};

// Save refresh token to database
const saveRefreshToken = async (userId, refreshToken) => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Save refresh token error:', error);
    throw new Error('Failed to save refresh token');
  }
};

// User registration with email verification
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please fix the following errors',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { email, password, name, age, gender, lookingFor, minAge, maxAge, city, state, country, latitude, longitude, bio, location, interests, photos } = req.body;    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      authLogger('REGISTRATION_FAILED', null, { reason: 'Email already exists', email });
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        action: {
          type: 'existing_user',
          message: 'You can sign in with your existing account or reset your password if forgotten',
          links: {
            login: 'https://soulsync.solutions/login',
            forgot_password: 'https://soulsync.solutions/forgot-password'
          }
        }
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Process optional arrays
    const processedInterests = Array.isArray(interests) 
      ? interests.filter(interest => interest && typeof interest === 'string' && interest.trim().length > 0)
      : [];
    
    const processedPhotos = Array.isArray(photos) 
      ? photos.filter(photo => photo && typeof photo === 'string' && photo.trim().length > 0)
      : [];

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        age: parseInt(age),
        gender,
        lookingFor,
        city: city || null,
        state: state || null,
        country: country || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        bio: bio || null,
        location: location || null,
        interests: processedInterests,
        photos: processedPhotos,
        isVerified: false, // User needs to verify email
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        lookingFor: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        bio: true,
        location: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true,
        createdAt: true
      }
    });

    authLogger('REGISTRATION_SUCCESS', user.id, { email: user.email, name: user.name });
    dbLogger('CREATE', 'users', { userId: user.id, email: user.email });

    // Create match preference if age range provided
    if (minAge || maxAge) {
      try {
        await prisma.matchPreference.create({
          data: {
            userId: user.id,
            minAge: minAge ? parseInt(minAge) : 18,
            maxAge: maxAge ? parseInt(maxAge) : 100,
            preferredGender: lookingFor !== 'everyone' ? lookingFor : null
          }
        });
      } catch (prefError) {
        console.error('Failed to create match preference:', prefError);
        // Don't fail registration if preference creation fails
      }
    }

    // Generate verification token
    const verificationToken = EmailService.generateVerificationToken(user.id);

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate auth tokens (user can use app but with limited features until verified)
    const { accessToken, refreshToken } = generateTokens(user.id);
    await saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken
        },
        nextStep: {
          type: 'email_verification',
          message: 'Check your email and click the verification link to fully activate your account',
          resend_link: 'https://soulsync.solutions/auth/resend-verification'
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    next(error);
  }
});

// Email verification
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Update user verification status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true
      }
    });

    res.json({
      success: true,
      message: 'Email verified successfully! Your account is now fully activated.',
      data: {
        user,
        redirect: 'https://soulsync.solutions/dashboard'
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired',
        action: {
          type: 'resend_verification',
          message: 'Request a new verification email',
          link: 'https://soulsync.solutions/auth/resend-verification'
        }
      });
    }
    
    next(error);
  }
});

// Resend verification email
router.post('/resend-verification', authenticateToken, async (req, res, next) => {
  try {
    const user = req.user;

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your account is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = EmailService.generateVerificationToken(user.id);

    // Send verification email
    await EmailService.sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully! Please check your email.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    next(error);
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please fix the following errors',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { email, password } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        gender: true,
        lookingFor: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        action: {
          type: 'account_not_found',
          message: 'No account found with this email. Would you like to create one?',
          links: {
            register: 'https://soulsync.solutions/register',
            forgot_password: 'https://soulsync.solutions/forgot-password'
          }
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        action: {
          type: 'wrong_password',
          message: 'Forgot your password?',
          links: {
            forgot_password: 'https://soulsync.solutions/forgot-password'
          }
        }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    await saveRefreshToken(user.id, refreshToken);

    // Get user's personality score
    const answersCount = await prisma.userAnswer.count({
      where: { userId: user.id }
    });
    const totalQuestions = 50;
    const personalityScore = Math.min(100, Math.round((answersCount / totalQuestions) * 100));

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response = {
      success: true,
      message: 'Welcome back! Login successful.',
      data: {
        user: {
          ...userWithoutPassword,
          personalityScore,
          questionsAnswered: answersCount
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    };

    // Add verification reminder if not verified
    if (!user.isVerified) {
      response.reminder = {
        type: 'email_verification',
        message: 'Please verify your email address to unlock all features',
        action: 'https://soulsync.solutions/auth/resend-verification'
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true
      }
    });

    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
      timeToCheck: 'Please check your email within the next few minutes.'
    };

    if (!user || !user.isActive) {
      // Return success but don't send email
      return res.json(successResponse);
    }

    // Generate password reset token
    const resetToken = EmailService.generatePasswordResetToken(user.id, user.email, user.password);

    // Send password reset email
    try {
      await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken, user.id);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to user
    }

    res.json(successResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('userId').notEmpty().withMessage('User ID is required'),
  body('newPassword').isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please fix the following errors',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { token, userId, newPassword } = req.body;

    // Get user with current password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link'
      });
    }

    // Verify reset token using current password hash as secret
    try {
      const secret = process.env.JWT_SECRET + user.password;
      const decoded = jwt.verify(token, secret);
      
      if (decoded.type !== 'password_reset' || decoded.userId !== userId || decoded.email !== user.email) {
        throw new Error('Invalid token');
      }
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link',
        action: {
          type: 'request_new_reset',
          message: 'Request a new password reset link',
          link: 'https://soulsync.solutions/forgot-password'
        }
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash }
    });

    // Invalidate all existing refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });

    // Send confirmation email
    try {
      await EmailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
    }

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
      data: {
        redirect: 'https://soulsync.solutions/login',
        message: 'Please log in with your new password'
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
});

// Change password (for logged-in users)
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6, max: 100 }).withMessage('New password must be between 6 and 100 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please fix the following errors',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    });

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password'
      });
    }
 
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
 
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash }
    });
 
    // Invalidate all existing refresh tokens except current session for security
    await prisma.refreshToken.deleteMany({
      where: { 
        userId,
        id: { not: req.tokenId } // Keep current session active
      }
    });
 
    // Send confirmation email
    try {
      await EmailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
    }
 
    res.json({
      success: true,
      message: 'Password changed successfully! Other devices will need to log in again.',
      data: {
        securityNote: 'All other sessions have been logged out for security'
      }
    });
  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
 });
 
 // Refresh token
 router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
 
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        action: {
          type: 'login_required',
          message: 'Please log in again',
          link: 'https://soulsync.solutions/login'
        }
      });
    }
 
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
 
    // Check if refresh token exists in database and is valid
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    });
 
    if (!tokenRecord || !tokenRecord.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        action: {
          type: 'login_required',
          message: 'Please log in again',
          link: 'https://soulsync.solutions/login'
        }
      });
    }
 
    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
 
    // Replace old refresh token with new one
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
 
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        action: {
          type: 'login_required',
          message: 'Please log in again',
          link: 'https://soulsync.solutions/login'
        }
      });
    }
    
    next(error);
  }
 });
 
 // Get current user
 router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        bio: true,
        location: true,
        gender: true,
        lookingFor: true,
        interests: true,
        photos: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
 
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found or account deactivated'
      });
    }

    // Get user's personality score
    const answersCount = await prisma.userAnswer.count({
      where: { userId: user.id }
    });
    const totalQuestions = 50;
    const personalityScore = Math.min(100, Math.round((answersCount / totalQuestions) * 100));
 
    const response = {
      success: true,
      data: { 
        user: {
          ...user,
          personalityScore,
          questionsAnswered: answersCount
        }
      }
    };
 
    // Add verification reminder if not verified
    if (!user.isVerified) {
      response.reminder = {
        type: 'email_verification',
        message: 'Please verify your email address to unlock all features',
        action: 'https://soulsync.solutions/auth/resend-verification'
      };
    }
 
    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    next(error);
  }
 });
 
 // Logout
 router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const { refreshToken, logoutAll = false } = req.body;
 
    if (logoutAll) {
      // Logout from all devices
      await prisma.refreshToken.deleteMany({
        where: { userId: req.user.id }
      });
      
      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } else if (refreshToken) {
      // Logout from current device only
      await prisma.refreshToken.deleteMany({
        where: { 
          userId: req.user.id,
          token: refreshToken 
        }
      });
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } else {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
 });
 
 // Delete account
 router.delete('/delete-account', authenticateToken, [
  body('password').notEmpty().withMessage('Password confirmation is required'),
  body('confirmation').equals('DELETE MY ACCOUNT').withMessage('Please type "DELETE MY ACCOUNT" to confirm')
 ], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm account deletion properly',
        errors: errors.array()
      });
    }
 
    const { password } = req.body;
    const userId = req.user.id;
 
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    });
 
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password confirmation'
      });
    }
 
    // Soft delete - deactivate account
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
      }
    });
 
    // Delete all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });
 
    // Delete related data (matches, messages, etc.)
    await Promise.all([
      prisma.match.deleteMany({ where: { userId } }),
      prisma.message.deleteMany({ where: { senderId: userId } }),
      prisma.subscription.deleteMany({ where: { userId } })
    ]);
 
    res.json({
      success: true,
      message: 'Account deleted successfully. We\'re sorry to see you go!'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    next(error);
  }
 });
 
 export default router;