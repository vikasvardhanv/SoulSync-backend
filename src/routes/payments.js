// backend/src/routes/payments.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../database/connection.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// NOWPayments API configuration
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

// Helper function to make NOWPayments API calls
const callNOWPaymentsAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${NOWPAYMENTS_API_URL}${endpoint}`,
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('NOWPayments API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Payment service error');
  }
};

// Get available currencies
router.get('/currencies', async (req, res, next) => {
  try {
    const currencies = await callNOWPaymentsAPI('/currencies');
    
    res.json({
      success: true,
      data: {
        currencies: currencies.currencies || []
      }
    });
  } catch (error) {
    console.error('Get currencies error:', error);
    next(error);
  }
});

// Estimate payment
router.post('/estimate', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('from_currency').isString().withMessage('From currency is required'),
  body('to_currency').isString().withMessage('To currency is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, from_currency, to_currency } = req.body;

    const estimate = await callNOWPaymentsAPI('/estimate', 'GET', null, {
      amount,
      currency_from: from_currency,
      currency_to: to_currency
    });

    res.json({
      success: true,
      data: estimate
    });
  } catch (error) {
    console.error('Payment estimate error:', error);
    next(error);
  }
});

// Create payment
router.post('/create', authenticateToken, [
  body('price_amount').isNumeric().withMessage('Price amount is required'),
  body('price_currency').isString().withMessage('Price currency is required'),
  body('pay_currency').isString().withMessage('Pay currency is required'),
  body('order_description').isString().withMessage('Order description is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      price_amount,
      price_currency,
      pay_currency,
      order_description
    } = req.body;

    const userId = req.user.id;
    const orderId = `soulsync_${userId}_${Date.now()}`;

    // Create payment request with NOWPayments
    const paymentData = {
      price_amount,
      price_currency,
      pay_currency,
      order_id: orderId,
      order_description,
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
    };

    const payment = await callNOWPaymentsAPI('/payment', 'POST', paymentData);

    // Save payment record to database
    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        paymentId: payment.payment_id,
        orderId,
        amount: price_amount,
        currency: price_currency,
        payCurrency: pay_currency,
        status: payment.payment_status || 'waiting',
        description: order_description,
        paymentUrl: payment.invoice_url,
        metadata: {
          nowpayments_data: payment
        }
      }
    });

    res.json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment_id: payment.payment_id,
        payment_url: payment.invoice_url,
        order_id: orderId,
        status: payment.payment_status,
        amount: price_amount,
        currency: price_currency,
        pay_currency: pay_currency
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    next(error);
  }
});

// Get payment status
router.get('/status/:paymentId', authenticateToken, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    // Get payment from database
    const paymentRecord = await prisma.payment.findFirst({
      where: {
        paymentId,
        userId
      }
    });

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get updated status from NOWPayments
    try {
      const paymentStatus = await callNOWPaymentsAPI(`/payment/${paymentId}`);
      
      // Update local status if different
      if (paymentStatus.payment_status !== paymentRecord.status) {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { 
            status: paymentStatus.payment_status,
            updatedAt: new Date()
          }
        });
      }

      res.json({
        success: true,
        data: {
          payment_id: paymentId,
          status: paymentStatus.payment_status,
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          order_id: paymentRecord.orderId,
          created_at: paymentRecord.createdAt,
          updated_at: paymentRecord.updatedAt
        }
      });
    } catch (apiError) {
      // If NOWPayments API fails, return local status
      res.json({
        success: true,
        data: {
          payment_id: paymentId,
          status: paymentRecord.status,
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          order_id: paymentRecord.orderId,
          created_at: paymentRecord.createdAt,
          updated_at: paymentRecord.updatedAt
        }
      });
    }
  } catch (error) {
    console.error('Get payment status error:', error);
    next(error);
  }
});

// Create subscription payment
router.post('/subscription', authenticateToken, [
  body('plan').isIn(['premium', 'gold']).withMessage('Invalid subscription plan'),
  body('duration').isIn(['monthly', 'yearly']).withMessage('Invalid duration'),
  body('payment_method').isIn(['crypto', 'card']).withMessage('Invalid payment method')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { plan, duration, payment_method } = req.body;
    const userId = req.user.id;

    // Define subscription prices
    const prices = {
      premium: {
        monthly: 9.99,
        yearly: 99.99
      },
      gold: {
        monthly: 19.99,
        yearly: 199.99
      }
    };

    const amount = prices[plan][duration];
    const orderId = `subscription_${userId}_${plan}_${duration}_${Date.now()}`;

    if (payment_method === 'crypto') {
      // Create crypto payment
      const paymentData = {
        price_amount: amount,
        price_currency: 'USD',
        pay_currency: 'BTC', // Default to Bitcoin, user can change
        order_id: orderId,
        order_description: `SoulSync ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription (${duration})`,
        success_url: `${process.env.FRONTEND_URL}/subscription/success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
      };

      const payment = await callNOWPaymentsAPI('/payment', 'POST', paymentData);

      // Save payment record
      const paymentRecord = await prisma.payment.create({
        data: {
          userId,
          paymentId: payment.payment_id,
          orderId,
          amount,
          currency: 'USD',
          payCurrency: 'BTC',
          status: payment.payment_status || 'waiting',
          description: paymentData.order_description,
          paymentUrl: payment.invoice_url,
          type: 'subscription',
          metadata: {
            plan,
            duration,
            nowpayments_data: payment
          }
        }
      });

      res.json({
        success: true,
        message: 'Subscription payment created successfully',
        data: {
          payment_id: payment.payment_id,
          payment_url: payment.invoice_url,
          order_id: orderId,
          plan,
          duration,
          amount,
          status: payment.payment_status
        }
      });
    } else {
      // Card payments would be handled by a different service
      res.status(501).json({
        success: false,
        message: 'Card payments not implemented yet'
      });
    }
  } catch (error) {
    console.error('Create subscription payment error:', error);
    next(error);
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: {
        id: true,
        paymentId: true,
        orderId: true,
        amount: true,
        currency: true,
        payCurrency: true,
        status: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const totalPayments = await prisma.payment.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalPayments,
          pages: Math.ceil(totalPayments / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    next(error);
  }
});

// NOWPayments webhook handler
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || '')
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { payment_id, payment_status, order_id } = req.body;

    // Update payment status in database
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymentId: payment_id },
          { orderId: order_id }
        ]
      },
      include: {
        user: true
      }
    });

    if (!payment) {
      console.error('Payment not found for webhook:', { payment_id, order_id });
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: payment_status,
        metadata: {
          ...payment.metadata,
          webhook_data: req.body
        }
      }
    });

    // Handle successful payments
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      // If it's a subscription payment, activate the subscription
      if (payment.type === 'subscription') {
        const metadata = payment.metadata;
        const plan = metadata.plan;
        const duration = metadata.duration;

        // Calculate expiry date
        const now = new Date();
        const expiryDate = new Date(now);
        if (duration === 'monthly') {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        // Create or update subscription
        await prisma.subscription.upsert({
          where: { userId: payment.userId },
          update: {
            plan,
            status: 'active',
            expiresAt: expiryDate,
            updatedAt: new Date()
          },
          create: {
            userId: payment.userId,
            plan,
            status: 'active',
            expiresAt: expiryDate
          }
        });

        console.log(`Subscription activated for user ${payment.userId}: ${plan} (${duration})`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    next(error);
  }
});

export default router;