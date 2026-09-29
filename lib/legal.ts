// Facts used by the legal pages. Placeholders are listed in PLACEHOLDERS.md.

import type { Fact } from './company';

export const legal: Record<string, Fact> = {
  icoNumber: { placeholder: 'ICO_REGISTRATION_NUMBER', label: 'ICO registration number, or remove this line if not held' },
  lastUpdated: { placeholder: 'LEGAL_LAST_UPDATED', label: 'Date these pages were last updated' },
  emailProvider: { placeholder: 'EMAIL_PROVIDER', label: 'Email delivery provider' },
  emailProviderLocation: { placeholder: 'EMAIL_PROVIDER_LOCATION', label: 'Country where the email provider processes data' },
  transferSafeguards: {
    placeholder: 'TRANSFER_SAFEGUARDS',
    label: 'Safeguard for transfers outside the UK, for example the UK Extension to the EU-US Data Privacy Framework or the UK International Data Transfer Addendum',
  },
  enquiryRetention: { placeholder: 'ENQUIRY_RETENTION', label: 'How long enquiries are kept' },
  correspondenceRetention: { placeholder: 'CORRESPONDENCE_RETENTION', label: 'How long emails and notes of calls are kept' },
  marketingRetention: { placeholder: 'MARKETING_RETENTION', label: 'How long marketing consent records are kept' },
  hostingLogRetention: { placeholder: 'HOSTING_LOG_RETENTION', label: 'How long hosting logs are kept' },
};
