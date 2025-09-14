import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

// PayPal webhook verification
function verifyPayPalWebhook(payload: string, headers: any): boolean {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const authAlgo = headers['paypal-auth-algo'];
    const transmission = headers['paypal-transmission-id'];
    const certId = headers['paypal-cert-id'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const transmissionTime = headers['paypal-transmission-time'];
    
    if (!webhookId || !authAlgo || !transmission || !certId || !transmissionSig || !transmissionTime) {
      logger.warn('PayPal webhook: Missing required headers for verification');
      return false;
    }

    // For production, you should implement proper webhook signature verification
    // using PayPal's public certificate. For now, we'll do basic validation.
    logger.info(`PayPal webhook: Headers validated - webhookId: ${webhookId}, authAlgo: ${authAlgo}, transmission: ${transmission}, certId: ${certId}`);
    
    return true;
  } catch (error) {
    logger.error('PayPal webhook: Verification failed', error as Error);
    return false;
  }
}

// Handle PayPal webhook events
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    logger.info(`PayPal webhook: Received webhook - auth-algo: ${headers['paypal-auth-algo']}, transmission-id: ${headers['paypal-transmission-id']}, cert-id: ${headers['paypal-cert-id']}, transmission-time: ${headers['paypal-transmission-time']}`);

    // Verify webhook signature
    if (!verifyPayPalWebhook(payload, headers)) {
      logger.warn('PayPal webhook: Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    let event;
    try {
      event = JSON.parse(payload);
    } catch (parseError) {
      logger.error('PayPal webhook: Failed to parse payload', parseError as Error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const eventType = event.event_type;
    const resource = event.resource;

    logger.info(`PayPal webhook: Processing event ${eventType} - resourceId: ${resource?.id}, status: ${resource?.status}`);

    // Handle different webhook events
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(event);
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentCaptureDenied(event);
        break;
        
      case 'PAYMENT.CAPTURE.PENDING':
        await handlePaymentCapturePending(event);
        break;
        
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event);
        break;
        
      case 'CHECKOUT.ORDER.COMPLETED':
        await handleOrderCompleted(event);
        break;
        
      default:
        logger.info(`PayPal webhook: Unhandled event type ${eventType}`);
        break;
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    logger.error('PayPal webhook: Error processing webhook', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle payment capture completed
async function handlePaymentCaptureCompleted(event: any) {
  try {
    const capture = event.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    const captureId = capture.id;
    const amount = capture.amount;
    const status = capture.status;
    
    logger.info(`PayPal webhook: Payment capture completed - orderId: ${orderId}, captureId: ${captureId}, amount: ${amount}, status: ${status}`);
    
    // Here you would typically:
    // 1. Update the booking status in your database
    // 2. Send confirmation emails
    // 3. Update any related records
    
    // TODO: Implement booking confirmation logic
    
  } catch (error) {
    logger.error('PayPal webhook: Error handling payment capture completed', error as Error);
  }
}

// Handle payment capture denied
async function handlePaymentCaptureDenied(event: any) {
  try {
    const capture = event.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    const captureId = capture.id;
    const reason = capture.status_details?.reason;
    
    logger.warn(`PayPal webhook: Payment capture denied - orderId: ${orderId}, captureId: ${captureId}, reason: ${reason}`);
    
    // Here you would typically:
    // 1. Update the booking status to failed/cancelled
    // 2. Send notification emails
    // 3. Release any reserved resources
    
    // TODO: Implement booking cancellation logic
    
  } catch (error) {
    logger.error('PayPal webhook: Error handling payment capture denied', error as Error);
  }
}

// Handle payment capture pending
async function handlePaymentCapturePending(event: any) {
  try {
    const capture = event.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    const captureId = capture.id;
    const reason = capture.status_details?.reason;
    
    logger.info(`PayPal webhook: Payment capture pending - orderId: ${orderId}, captureId: ${captureId}, reason: ${reason}`);
    
    // Here you would typically:
    // 1. Update the booking status to pending
    // 2. Send pending notification emails
    // 3. Set up monitoring for status changes
    
    // TODO: Implement pending payment logic
    
  } catch (error) {
    logger.error('PayPal webhook: Error handling payment capture pending', error as Error);
  }
}

// Handle order approved
async function handleOrderApproved(event: any) {
  try {
    const order = event.resource;
    const orderId = order.id;
    const status = order.status;
    
    logger.info(`PayPal webhook: Order approved - orderId: ${orderId}, status: ${status}`);
    
    // Here you would typically:
    // 1. Log the approval for tracking
    // 2. Prepare for capture
    
    // TODO: Implement order approval logic
    
  } catch (error) {
    logger.error('PayPal webhook: Error handling order approved', error as Error);
  }
}

// Handle order completed
async function handleOrderCompleted(event: any) {
  try {
    const order = event.resource;
    const orderId = order.id;
    const status = order.status;
    
    logger.info(`PayPal webhook: Order completed - orderId: ${orderId}, status: ${status}`);
    
    // Here you would typically:
    // 1. Final confirmation of the order
    // 2. Update all related systems
    
    // TODO: Implement order completion logic
    
  } catch (error) {
    logger.error('PayPal webhook: Error handling order completed', error as Error);
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // PayPal webhook verification challenge
    logger.info('PayPal webhook: Responding to verification challenge');
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  return NextResponse.json(
    { message: 'PayPal webhook endpoint is active' },
    { status: 200 }
  );
}