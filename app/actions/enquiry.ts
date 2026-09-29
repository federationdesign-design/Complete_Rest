'use server';

import { headers } from 'next/headers';
import { contact } from '../../lib/site';
import { DeliveryNotConfigured, deliverEnquiry } from '../../lib/enquiry/deliver';
import { allowRequest } from '../../lib/enquiry/rateLimit';
import {
  HONEYPOT_FIELD,
  MIN_SECONDS_TO_SUBMIT,
  STARTED_FIELD,
  readValues,
  validate,
  type EnquiryState,
} from '../../lib/enquiry/schema';

const FALLBACK = `Please try again, or email us at ${contact.email} or call ${contact.phoneDisplay}.`;

export async function submitEnquiry(_previous: EnquiryState, form: FormData): Promise<EnquiryState> {
  const values = readValues(form);

  // Honeypot filled: almost certainly a bot. Report success and drop it.
  if (String(form.get(HONEYPOT_FIELD) ?? '').trim()) return { status: 'sent', name: '' };

  // Too fast to be a person. The timestamp is set by the browser; it is
  // missing when JavaScript is off, in which case this check is skipped.
  const started = Number(form.get(STARTED_FIELD));
  if (started && Date.now() - started < MIN_SECONDS_TO_SUBMIT * 1000) {
    return { status: 'failed', message: 'That was very quick. Please check your details and send the form again.', values };
  }

  const errors = validate(values);
  if (Object.keys(errors).length > 0) return { status: 'invalid', errors, values };

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  if (!allowRequest(ip)) {
    return { status: 'failed', message: `You have sent several enquiries in a short time. ${FALLBACK}`, values };
  }

  try {
    await deliverEnquiry({ ...values, receivedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[enquiry] delivery failed', error instanceof DeliveryNotConfigured ? error.message : error);
    return { status: 'failed', message: `Sorry, we could not send your enquiry. ${FALLBACK}`, values };
  }

  return { status: 'sent', name: values.name };
}
