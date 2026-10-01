// Company facts for the footer statement, legal pages and schema.
// Anything not yet confirmed by Steve is a placeholder, logged in PLACEHOLDERS.md.
// The legal name, company number and VAT number were confirmed in round 2.

export type Fact = { value: string } | { placeholder: string; label: string };

export const company: Record<'legalName' | 'companyNumber' | 'registeredOffice' | 'vatNumber', Fact> = {
  legalName: { value: 'The Complete Restoration Company (Hertford) Limited' },
  companyNumber: { value: '03905618' },
  registeredOffice: { placeholder: 'REGISTERED_OFFICE', label: 'Registered office address' },
  vatNumber: { value: '749 8815 68' },
};
