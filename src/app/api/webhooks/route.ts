import { NextRequest, NextResponse } from 'next/server';

// Tipos de eventos webhook
export type WebhookEvent = 
  | 'user.registered'
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'payment.completed'
  | 'review.created';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
}

// Configuración de webhooks desde variables de entorno
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const WEBHOOK_ENABLED = process.env.WEBHOOK_ENABLED === 'true';

// Función para enviar webhook a n8n
export async function sendWebhook(event: WebhookEvent, data: Record<string, any>) {
  if (!WEBHOOK_ENABLED || !N8N_WEBHOOK_URL) {
    console.log('Webhooks disabled or URL not configured');
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET || '',
        'User-Agent': 'TeeReserve-Webhook/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log(`Webhook sent successfully for event: ${event}`);
  } catch (error) {
    console.error('Failed to send webhook:', error);
    // En producción, podrías querer almacenar esto en una cola para reintento
  }
}

// Endpoint para recibir webhooks (opcional, para integraciones bidireccionales)
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-secret');
    
    // Verificar la firma del webhook
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    console.log('Received webhook:', payload);

    // Aquí puedes procesar diferentes tipos de webhooks entrantes
    switch (payload.event) {
      case 'automation.trigger':
        // Manejar triggers de automatización desde n8n
        console.log('Processing automation trigger:', payload.data);
        break;
      
      case 'notification.send':
        // Manejar solicitudes de notificación desde n8n
        console.log('Processing notification request:', payload.data);
        break;
      
      default:
        console.log('Unknown webhook event:', payload.event);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Endpoint para verificar el estado del webhook (health check)
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    webhooks_enabled: WEBHOOK_ENABLED,
    timestamp: new Date().toISOString()
  });
}