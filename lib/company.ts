// Company facts for the footer statement, legal pages and schema.
// Anything not yet confirmed by Steve is a placeholder, logged in PLACEHOLDERS.md.
// The legal name, company number and VAT number were confirmed in round 2,
// and the registered office in round 3. The trading address is the same as
// the registered office.

export type Fact = { value: string } | { placeholder: string; label: string };

export const company: Record<'legalName' | 'companyNumber' | 'registeredOffice' | 'vatNumber', Fact> = {
  legalName: { value: 'The Complete Restoration Company (Hertford) Limited' },
  companyNumber: { value: '03905618' },
  registeredOffice: { value: 'Lordship Lodge, Dane End, Ware, Hertfordshire, SG12 0NS' },
  vatNumber: { value: '749 8815 68' },
};
