// Company facts for the footer statement and legal pages.
// Anything not yet confirmed by Steve is a placeholder, logged in PLACEHOLDERS.md.

export type Fact = { value: string } | { placeholder: string; label: string };

export const company: Record<'legalName' | 'companyNumber' | 'registeredOffice' | 'vatNumber', Fact> = {
  legalName: { placeholder: 'LEGAL_ENTITY_NAME', label: 'Legal entity name' },
  companyNumber: { placeholder: 'COMPANY_NUMBER', label: 'Company number' },
  registeredOffice: { placeholder: 'REGISTERED_OFFICE', label: 'Registered office address' },
  vatNumber: { placeholder: 'VAT_NUMBER', label: 'VAT number' },
};
