import 'server-only';

interface ReceiptParams {
  to: string;
  orderId: string;
  totalCents: number;
  currency: string;
  items: string[];
}

/**
 * Email receipt hook. No provider is bundled — when EMAIL_API_KEY is empty the
 * receipt is logged server-side so the flow is visible in development.
 * Plug in Resend/Postmark/etc. here when credentials are available.
 */
export async function sendReceiptEmail(params: ReceiptParams): Promise<void> {
  if (!process.env.EMAIL_API_KEY) {
    console.info(
      `[email] (dev) Receipt for order ${params.orderId} → ${params.to}: ` +
        `${params.items.join(', ')} — ${Math.round(params.totalCents / 100)} ${params.currency}`
    );
    return;
  }
  // TODO(production): implement the real provider call using EMAIL_API_KEY / EMAIL_FROM.
  console.warn('[email] EMAIL_API_KEY is set but no provider adapter is implemented yet.');
}
