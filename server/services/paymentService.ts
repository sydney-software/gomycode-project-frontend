import Stripe from 'stripe';
import axios from 'axios';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  data?: any;
}

export interface PaymentData {
  amount: number; // in cents for Stripe, in KES for M-Pesa
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
}

export class PaymentService {
  // Stripe payment processing for card payments
  static async processCardPayment(
    paymentData: PaymentData,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        description: paymentData.description,
        receipt_email: paymentData.customerEmail,
        return_url: `${process.env.CLIENT_URL}/payment/success`,
      });

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          data: paymentIntent,
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          error: 'Payment requires additional authentication',
          data: {
            requires_action: true,
            payment_intent: {
              id: paymentIntent.id,
              client_secret: paymentIntent.client_secret,
            },
          },
        };
      } else {
        return {
          success: false,
          error: 'Payment failed',
          data: paymentIntent,
        };
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  }

  // M-Pesa payment processing (Safaricom Daraja API)
  static async processMpesaPayment(
    paymentData: PaymentData,
    phoneNumber: string
  ): Promise<PaymentResult> {
    try {
      // Get M-Pesa access token
      const accessToken = await this.getMpesaAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Failed to get M-Pesa access token',
        };
      }

      // Format phone number (remove + and ensure it starts with 254)
      const formattedPhone = this.formatMpesaPhoneNumber(phoneNumber);
      
      // Generate timestamp
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      
      // Generate password
      const shortcode = process.env.MPESA_SHORTCODE!;
      const passkey = process.env.MPESA_PASSKEY!;
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

      // STK Push request
      const stkPushResponse = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(paymentData.amount), // M-Pesa amount should be in whole numbers
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: `${process.env.CLIENT_URL}/api/payments/mpesa/callback`,
          AccountReference: `Order-${Date.now()}`,
          TransactionDesc: paymentData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (stkPushResponse.data.ResponseCode === '0') {
        return {
          success: true,
          transactionId: stkPushResponse.data.CheckoutRequestID,
          data: stkPushResponse.data,
        };
      } else {
        return {
          success: false,
          error: stkPushResponse.data.ResponseDescription || 'M-Pesa payment failed',
        };
      }
    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'M-Pesa payment failed',
      };
    }
  }

  // Cash on Delivery - no actual payment processing needed
  static async processCODPayment(paymentData: PaymentData): Promise<PaymentResult> {
    // For COD, we just return success with a generated transaction ID
    const transactionId = `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      data: {
        paymentMethod: 'cod',
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
      },
    };
  }

  // Helper method to get M-Pesa access token
  private static async getMpesaAccessToken(): Promise<string | null> {
    try {
      const consumerKey = process.env.MPESA_CONSUMER_KEY!;
      const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

      const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      return null;
    }
  }

  // Helper method to format phone number for M-Pesa
  private static formatMpesaPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If it doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  // Verify payment status (can be used for webhooks)
  static async verifyPayment(
    paymentMethod: 'card' | 'mpesa' | 'cod',
    transactionId: string
  ): Promise<PaymentResult> {
    switch (paymentMethod) {
      case 'card':
        return this.verifyStripePayment(transactionId);
      case 'mpesa':
        return this.verifyMpesaPayment(transactionId);
      case 'cod':
        return { success: true, transactionId };
      default:
        return { success: false, error: 'Invalid payment method' };
    }
  }

  private static async verifyStripePayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntentId,
        data: paymentIntent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private static async verifyMpesaPayment(checkoutRequestId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getMpesaAccessToken();
      if (!accessToken) {
        return { success: false, error: 'Failed to get access token' };
      }

      // Query STK Push status
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const shortcode = process.env.MPESA_SHORTCODE!;
      const passkey = process.env.MPESA_PASSKEY!;
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
        {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: response.data.ResultCode === '0',
        transactionId: checkoutRequestId,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
