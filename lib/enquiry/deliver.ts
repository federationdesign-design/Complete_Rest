// Enquiry delivery.
//
// Placeholders (PLACEHOLDERS.md): EMAIL_PROVIDER, ENQUIRY_RECIPIENT,
// ENQUIRY_STORAGE. Until Steve confirms the email provider and recipient,
// the only provider is "console", which logs the enquiry on the server and
// is refused in production so enquiries are never silently lost.
//
// Environment variables:
//   ENQUIRY_PROVIDER   provider name; "console" (default outside production)
//   ENQUIRY_TO         recipient address for enquiries
//   ENQUIRY_FROM       sender address the provider is allowed to send from

import type { EnquiryValues } from './schema';

export class DeliveryNotConfigured extends Error {}

export type Enquiry = EnquiryValues & { receivedAt: string };

export async function deliverEnquiry(enquiry: Enquiry): Promise<void> {
  const provider = process.env.ENQUIRY_PROVIDER ?? (process.env.NODE_ENV === 'production' ? '' : 'console');

  switch (provider) {
    case 'console':
      if (process.env.NODE_ENV === 'production') throw new DeliveryNotConfigured('console provider in production');
      console.info('[enquiry] (console provider, not sent)', formatEnquiry(enquiry));
      return;
    default:
      throw new DeliveryNotConfigured(`No email provider configured (ENQUIRY_PROVIDER="${provider}")`);
  }
}

// Plain-text body for whichever provider is chosen.
export function formatEnquiry(e: Enquiry): string {
  return [
    `New website enquiry, received ${e.receivedAt}`,
    '',
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Phone: ${e.phone || 'not given'}`,
    `Postcode or town: ${e.location || 'not given'}`,
    `Marketing emails: ${e.marketing ? 'yes, opted in' : 'no'}`,
    '',
    e.message,
  ].join('\n');
}
