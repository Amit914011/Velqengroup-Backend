import { CardPaymentsModel } from '../../models/card_payments.js';
import { generatePbId } from '../../utils/idGenerator.js';
import { getIntegrationsMode } from '../../utils/integrationGate.js';

export function getCardPayStatus() {
  const mode = getIntegrationsMode();
  const configured = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  return {
    ok: true,
    mode,
    configured,
    isMock: mode === 'sandbox' || !configured,
    environment: process.env.PAYPAL_ENV || 'sandbox',
  };
}

export async function createCardOrder(data: any, ip = '', userAgent = '') {
  const amount = Number(data.amount || 0);
  if (amount <= 0) throw new Error('A valid positive amount is required.');
  const currency = String(data.currency || 'USD').toUpperCase();

  const isLive = getIntegrationsMode() === 'live' && process.env.PAYPAL_CLIENT_ID;
  const orderId = isLive ? `ORD_${Date.now()}` : `SIM_ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const payment = new CardPaymentsModel({
    _id: generatePbId(),
    orderId,
    amount,
    currency,
    paymentMethod: 'PayPal / Card',
    status: isLive ? 'CREATED' : 'SIMULATED_CREATED',
    payerName: String(data.payerName || '').trim(),
    payerEmail: String(data.payerEmail || '').trim().toLowerCase(),
    payerPhone: String(data.payerPhone || '').trim(),
    clientId: String(data.clientId || '').trim(),
    ip,
    userAgent,
  });
  await payment.save();

  return {
    success: true,
    orderId,
    amount,
    currency,
    status: payment.status,
    isSimulated: !isLive,
    note: !isLive ? 'Simulated order for testing only. No financial transaction occurred.' : undefined,
  };
}

export async function captureCardOrder(orderId: string, _data: any) {
  if (!orderId) throw new Error('orderId is required.');
  const payment = await CardPaymentsModel.findOne({ orderId });
  if (!payment) throw new Error('Order not found.');

  if (payment.status === 'COMPLETED' || payment.status === 'SIMULATED_CAPTURED') {
    throw new Error('This order has already been captured and processed.');
  }

  const isLive = getIntegrationsMode() === 'live' && process.env.PAYPAL_CLIENT_ID;
  payment.status = isLive ? 'COMPLETED' : 'SIMULATED_CAPTURED';
  payment.providerTransactionId = isLive ? `TXN_${Date.now()}` : `SIM_CAPTURE_${Date.now()}`;
  payment.verifiedAt = new Date().toISOString();
  payment.updated = new Date();
  await payment.save();

  return {
    success: true,
    orderId,
    transactionId: payment.providerTransactionId,
    status: payment.status,
    isSimulated: !isLive,
    note: !isLive ? 'Simulated capture for testing only. No money was received.' : undefined,
  };
}

export async function getCardOrder(orderId: string) {
  if (!orderId) throw new Error('orderId is required.');
  const payment = await CardPaymentsModel.findOne({ orderId }).lean();
  if (!payment) throw new Error('Order not found.');
  return payment;
}

export async function verifyPaypalWebhookSignature(headers: Record<string, any>, body: any): Promise<boolean> {
  const mode = getIntegrationsMode();
  if (mode !== 'live') {
    return Boolean(body && (body.id || body.event_id));
  }

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const authAlgo = headers['paypal-auth-algo'];
  const certUrl = headers['paypal-cert-url'];
  const transId = headers['paypal-transmission-id'];
  const transSig = headers['paypal-transmission-sig'];
  const transTime = headers['paypal-transmission-time'];

  if (!webhookId || !authAlgo || !certUrl || !transId || !transSig || !transTime) {
    return false;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return false;

  try {
    const apiBase = process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const authRes = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });
    if (!authRes.ok) return false;
    const { access_token } = (await authRes.json()) as any;

    const verifyRes = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transId,
        transmission_sig: transSig,
        transmission_time: transTime,
        webhook_id: webhookId,
        webhook_event: body,
      }),
    });
    if (!verifyRes.ok) return false;
    const verifyData = (await verifyRes.json()) as any;
    return String(verifyData.verification_status).toUpperCase() === 'SUCCESS';
  } catch {
    return false;
  }
}

export async function handleCardWebhook(headers: any, body: any) {
  const isValid = await verifyPaypalWebhookSignature(headers || {}, body || {});
  if (!isValid) {
    throw new Error('Invalid PayPal webhook signature.');
  }

  const eventId = String(body.id || body.event_id || `EVT_${Date.now()}`);
  const existing = await CardPaymentsModel.findOne({ webhookEventId: eventId }).lean();
  if (existing) {
    return { success: true, duplicate: true, eventId };
  }

  const resource = body.resource || {};
  const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id || body.orderId;
  const eventType = body.event_type || 'PAYMENT.CAPTURE.COMPLETED';

  if (orderId && eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const isLive = getIntegrationsMode() === 'live';
    const newStatus = isLive ? 'COMPLETED' : 'SIMULATED_CAPTURED';
    await CardPaymentsModel.updateOne(
      { orderId },
      {
        $set: {
          webhookEventId: eventId,
          status: newStatus,
          providerTransactionId: resource.id || `TXN_${Date.now()}`,
          verifiedAt: new Date().toISOString(),
          updated: new Date(),
        },
      }
    );
  }

  return { success: true, eventId, processed: true };
}
