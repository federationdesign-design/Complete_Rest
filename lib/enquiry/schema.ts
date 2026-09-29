// Enquiry form fields and validation, shared by the browser and the server so
// the two always agree (brief 8.7).

export const FIELDS = ['name', 'email', 'phone', 'location', 'message'] as const;
export type Field = (typeof FIELDS)[number];

export type EnquiryValues = Record<Field, string> & { marketing: boolean };
export type FieldErrors = Partial<Record<Field, string>>;

export const LIMITS: Record<Field, number> = {
  name: 100,
  email: 254,
  phone: 30,
  location: 100,
  message: 5000,
};

// Spam protection (brief 8.5)
export const HONEYPOT_FIELD = 'website';
export const STARTED_FIELD = 'startedAt';
export const MIN_SECONDS_TO_SUBMIT = 3;

// Brief 10.5: remove the marketing checkbox if Steve confirms the client does
// not send marketing emails (see PLACEHOLDERS.md, MARKETING_EMAILS).
export const SHOW_MARKETING_OPT_IN = true;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS = /^[0-9+()\-.\s]+$/;

export function readValues(form: FormData): EnquiryValues {
  const text = (key: Field) => String(form.get(key) ?? '').trim();
  return {
    name: text('name'),
    email: text('email'),
    phone: text('phone'),
    location: text('location'),
    message: text('message'),
    marketing: form.get('marketing') === 'yes',
  };
}

// Messages say what is wrong and how to fix it.
export function validate(values: EnquiryValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name) errors.name = 'Enter your name';
  else if (values.name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer`;

  if (!values.email) errors.email = 'Enter your email address';
  else if (values.email.length > LIMITS.email || !EMAIL.test(values.email))
    errors.email = 'Enter an email address in the correct format, like name@example.com';

  if (values.phone) {
    const digits = values.phone.replace(/\D/g, '').length;
    if (!PHONE_CHARS.test(values.phone) || digits < 7 || digits > 15 || values.phone.length > LIMITS.phone)
      errors.phone = 'Enter a phone number, like 01632 960000, or leave this blank';
  }

  if (values.location.length > LIMITS.location)
    errors.location = `Postcode or town must be ${LIMITS.location} characters or fewer`;

  if (!values.message) errors.message = 'Enter your message';
  else if (values.message.length > LIMITS.message)
    errors.message = `Message must be ${LIMITS.message.toLocaleString('en-GB')} characters or fewer`;

  return errors;
}

export type EnquiryState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: FieldErrors; values: EnquiryValues }
  | { status: 'failed'; message: string; values: EnquiryValues }
  | { status: 'sent'; name: string };
