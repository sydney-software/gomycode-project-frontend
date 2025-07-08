import { Router } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/paymentService';
import { authenticate } from '../middleware/auth';
import { Order } from '../models';

const router = Router();

// Validation schemas
const cardPaymentSchema = z.object({
  orderId: z.string(),
  paymentMethodId: z.string(),
});

const mpesaPaymentSchema = z.object({
  orderId: z.string(),
  phoneNumber: z.string(),
});

const codPaymentSchema = z.object({
  orderId: z.string(),
});

// Process card payment
router.post('/card', authenticate, async (req, res) => {
  try {
    const validatedData = cardPaymentSchema.parse(req.body);
    
    // Get order details
    const order = await Order.findById(validatedData.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify order belongs to user
    if (order.user && order.user.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    // Process payment
    const paymentResult = await PaymentService.processCardPayment(
      {
        amount: Math.round(parseFloat(order.total.toString()) * 100), // Convert to cents
        currency: 'USD',
        description: `Payment for order #${order.orderNumber}`,
        customerEmail: order.email,
        customerName: `${order.firstName} ${order.lastName}`,
      },
      validatedData.paymentMethodId
    );
    
    if (paymentResult.success) {
      // Update order payment status
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.paymentDetails = {
        method: 'card',
        transactionId: paymentResult.transactionId,
        paidAt: new Date(),
      };
      await order.save();
      
      return res.json({
        success: true,
        message: 'Payment processed successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
        transaction: paymentResult.transactionId,
      });
    } else if (paymentResult.data?.requires_action) {
      // 3D Secure authentication required
      return res.json({
        success: false,
        requires_action: true,
        payment_intent_client_secret: paymentResult.data.payment_intent.client_secret,
        message: 'Additional authentication required',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: paymentResult.error || 'Payment failed',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Card payment error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// Process M-Pesa payment
router.post('/mpesa', authenticate, async (req, res) => {
  try {
    const validatedData = mpesaPaymentSchema.parse(req.body);
    
    // Get order details
    const order = await Order.findById(validatedData.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify order belongs to user
    if (order.user && order.user.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    // Process payment
    const paymentResult = await PaymentService.processMpesaPayment(
      {
        amount: parseFloat(order.total.toString()),
        currency: 'KES',
        description: `Payment for order #${order.orderNumber}`,
        customerEmail: order.email,
        customerName: `${order.firstName} ${order.lastName}`,
        customerPhone: order.phone,
      },
      validatedData.phoneNumber
    );
    
    if (paymentResult.success) {
      // Update order payment details (status remains pending until callback)
      order.paymentDetails = {
        method: 'mpesa',
        transactionId: paymentResult.transactionId,
        checkoutRequestId: paymentResult.transactionId,
        initiatedAt: new Date(),
      };
      await order.save();
      
      return res.json({
        success: true,
        message: 'M-Pesa payment initiated successfully. Please check your phone to complete the transaction.',
        checkoutRequestId: paymentResult.transactionId,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: paymentResult.error || 'Failed to initiate M-Pesa payment',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('M-Pesa payment error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// Process Cash on Delivery
router.post('/cod', authenticate, async (req, res) => {
  try {
    const validatedData = codPaymentSchema.parse(req.body);
    
    // Get order details
    const order = await Order.findById(validatedData.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify order belongs to user
    if (order.user && order.user.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    // Process COD (no actual payment, just record)
    const paymentResult = await PaymentService.processCODPayment({
      amount: parseFloat(order.total.toString()),
      currency: 'USD',
      description: `Cash on Delivery for order #${order.orderNumber}`,
      customerEmail: order.email,
      customerName: `${order.firstName} ${order.lastName}`,
    });
    
    // Update order status
    order.paymentStatus = 'pending'; // Will be paid on delivery
    order.orderStatus = 'confirmed';
    order.paymentDetails = {
      method: 'cod',
      transactionId: paymentResult.transactionId,
      confirmedAt: new Date(),
    };
    await order.save();
    
    return res.json({
      success: true,
      message: 'Cash on Delivery order confirmed',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('COD processing error:', error);
    res.status(500).json({ message: 'Order processing failed' });
  }
});

// M-Pesa callback endpoint
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    
    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const checkoutRequestId = Body.stkCallback.CheckoutRequestID;
      const transactionId = Body.stkCallback.CallbackMetadata.Item.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;
      
      // Find order with this checkout request ID
      const order = await Order.findOne({
        'paymentDetails.checkoutRequestId': checkoutRequestId,
      });
      
      if (order) {
        // Update order status
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paymentDetails = {
          ...order.paymentDetails,
          transactionId,
          paidAt: new Date(),
        };
        await order.save();
      }
      
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } else {
      // Payment failed
      const checkoutRequestId = Body.stkCallback.CheckoutRequestID;
      
      // Find order with this checkout request ID
      const order = await Order.findOne({
        'paymentDetails.checkoutRequestId': checkoutRequestId,
      });
      
      if (order) {
        // Update order status
        order.paymentStatus = 'failed';
        order.paymentDetails = {
          ...order.paymentDetails,
          failureReason: Body.stkCallback.ResultDesc,
          failedAt: new Date(),
        };
        await order.save();
      }
      
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return res.status(500).json({ ResultCode: 1, ResultDesc: 'Server Error' });
  }
});

// Verify payment status
router.get('/verify/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify order belongs to user
    if (order.user && order.user.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    if (!order.paymentDetails?.transactionId) {
      return res.status(400).json({ message: 'No payment found for this order' });
    }
    
    const paymentResult = await PaymentService.verifyPayment(
      order.paymentMethod as 'card' | 'mpesa' | 'cod',
      order.paymentDetails.transactionId
    );
    
    return res.json({
      success: paymentResult.success,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentDetails: order.paymentDetails,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

export default router;
