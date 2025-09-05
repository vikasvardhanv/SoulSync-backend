// backend/src/routes/images.js - Database-only image storage
import express from 'express';
import multer from 'multer';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import prisma from '../database/connection.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Memory storage for processing images
const storage = multer.memoryStorage();

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (smaller for database storage)
    files: 6 // Allow up to 6 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`);
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  },
});

// Helper function to compress image if needed
const compressImage = (buffer, mimetype) => {
  // For now, just return the buffer as-is
  // You could add image compression here later if needed
  return buffer;
};

// Upload multiple images - database storage
router.post('/upload-multiple', optionalAuth, (req, res) => {
  upload.array('images', 6)(req, res, async (err) => {
    if (err) {
      // Handle multer and other errors
      return res.status(500).json({ success: false, message: err.message });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No image files provided' });
      }

      const uploadedImages = [];
      for (const file of req.files) {
        const compressedBuffer = compressImage(file.buffer, file.mimetype);
        const base64Image = compressedBuffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64Image}`;

        const savedImage = await prisma.image.create({
          data: {
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            data: base64Image,
            userId: req.user?.id || null
          }
        });
        uploadedImages.push({
            imageId: savedImage.id,
            imageUrl: dataUrl
        });
      }

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedImages
      });

    } catch (error) {
      console.error('Image processing error:', error);
      res.status(500).json({ success: false, message: 'Failed to process uploaded images' });
    }
  });
});

// Upload single image - database storage
router.post('/upload', optionalAuth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(413).json({
              success: false,
              message: 'File size too large. Maximum 5MB allowed.',
              error: {
                type: 'FILE_SIZE_ERROR',
                maxSize: '5MB',
                suggestion: 'Please compress your image or choose a smaller file.'
              }
            });
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              success: false,
              message: 'Unexpected field name. Use "image" as the field name.',
              error: { type: 'FIELD_NAME_ERROR' }
            });
          default:
            return res.status(400).json({
              success: false,
              message: `Upload error: ${err.message}`,
              error: { type: 'MULTER_ERROR' }
            });
        }
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: err.message,
          error: {
            type: 'INVALID_FILE_TYPE',
            allowedTypes: ['JPEG', 'PNG', 'WebP'],
            suggestion: 'Please upload a valid image file.'
          }
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Upload failed. Please try again.',
        error: { 
          type: 'UNKNOWN_ERROR',
          details: err.message
        }
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
          error: {
            type: 'NO_FILE_ERROR',
            suggestion: 'Please select an image file to upload.'
          }
        });
      }

      // Process the image
      const compressedBuffer = compressImage(req.file.buffer, req.file.mimetype);
      const base64Image = compressedBuffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      try {
        // Save image to database
        const savedImage = await prisma.image.create({
          data: {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            data: base64Image,
            userId: req.user?.id || null
          }
        });

        // If user is authenticated, add to their photos array
        if (req.user) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: req.user.id },
              select: { photos: true }
            });

            if (user) {
              if (user.photos.length >= 6) {
                // Delete the uploaded image since we can't use it
                await prisma.image.delete({
                  where: { id: savedImage.id }
                });
                
                return res.status(400).json({
                  success: false,
                  message: 'Maximum 6 photos allowed',
                  error: {
                    type: 'PHOTO_LIMIT_EXCEEDED',
                    maxPhotos: 6,
                    currentCount: user.photos.length,
                    suggestion: 'Delete an existing photo before uploading a new one.'
                  }
                });
              }

              // Add image ID to user's photos array
              const updatedPhotos = [...user.photos, savedImage.id];
              
              await prisma.user.update({
                where: { id: req.user.id },
                data: { photos: updatedPhotos }
              });
            }
          } catch (dbError) {
            console.error('Error updating user profile:', dbError);
            // Continue anyway - return the image even if we can't save to profile
          }
        }

        // Return success response
        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            imageId: savedImage.id,
            imageUrl: dataUrl, // For immediate display
            uploadedAt: savedImage.createdAt,
            fileInfo: {
              originalName: req.file.originalname,
              size: req.file.size,
              mimeType: req.file.mimetype
            }
          }
        });

      } catch (dbError) {
        console.error('Database error during image save:', dbError);
        
        res.status(500).json({
          success: false,
          message: 'Failed to save image to database',
          error: {
            type: 'DATABASE_ERROR',
            suggestion: 'Please try again or contact support if the issue persists.'
          }
        });
      }

    } catch (error) {
      console.error('Image processing error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded image',
        error: {
          type: 'PROCESSING_ERROR',
          suggestion: 'Please try again or contact support if the issue persists.'
        }
      });
    }
  });
});

// Test endpoint (must be before parameterized routes)
router.get('/test', async (req, res) => {
  try {
    // Test database connection
    let databaseStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (dbError) {
      console.error('Database test failed:', dbError);
      databaseStatus = 'error: ' + dbError.message;
    }

    res.json({
      success: true,
      message: 'Images API test results (database storage)',
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
        storage: 'database'
      },
      config: {
        maxFileSize: '5MB',
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxPhotos: 6,
        storageType: 'database'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get user's images
router.get('/user/photos', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { photos: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all images for this user
    const images = await prisma.image.findMany({
      where: {
        id: { in: user.photos }
      },
      select: {
        id: true,
        data: true,
        mimetype: true,
        filename: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Convert to data URLs
    const photoUrls = images.map(img => ({
      id: img.id,
      url: `data:${img.mimetype};base64,${img.data}`,
      filename: img.filename,
      uploadedAt: img.createdAt
    }));

    res.json({
      success: true,
      data: {
        photos: photoUrls,
        totalCount: photoUrls.length
      }
    });

  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user photos'
    });
  }
});

// Delete photo
router.delete('/delete', authenticateToken, [
  body('imageId').notEmpty().withMessage('Image ID required')
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

    const userId = req.user.id;
    const { imageId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { photos: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.photos.includes(imageId)) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found in your profile'
      });
    }

    // Remove from user's photos array
    const updatedPhotos = user.photos.filter(photo => photo !== imageId);
    
    await prisma.user.update({
      where: { id: userId },
      data: { photos: updatedPhotos }
    });

    // Delete the image from database
    await prisma.image.delete({
      where: { id: imageId }
    });

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        totalPhotos: updatedPhotos.length
      }
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo'
    });
  }
});

// Get image by ID (must be last to avoid conflicts)
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: {
        data: true,
        mimetype: true,
        filename: true
      }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Return image as data URL
    const dataUrl = `data:${image.mimetype};base64,${image.data}`;
    
    res.json({
      success: true,
      data: {
        imageUrl: dataUrl,
        filename: image.filename,
        mimetype: image.mimetype
      }
    });

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image'
    });
  }
});

export default router;