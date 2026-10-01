'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import { submitEnquiry } from '../../app/actions/enquiry';
import {
  HONEYPOT_FIELD,
  LIMITS,
  SHOW_MARKETING_OPT_IN,
  STARTED_FIELD,
  readValues,
  validate,
  type EnquiryState,
  type EnquiryValues,
  type Field,
  type FieldErrors,
} from '../../lib/enquiry/schema';
import { siteName } from '../../lib/site';
import styles from './EnquiryForm.module.css';

const EMPTY: EnquiryValues = { name: '', email: '', phone: '', location: '', message: '', marketing: false };

type FieldConfig = {
  name: Field;
  label: string;
  optional?: boolean;
  type?: 'text' | 'email' | 'tel';
  autoComplete: string;
  multiline?: boolean;
};

const FIELD_CONFIG: FieldConfig[] = [
  { name: 'name', label: 'Name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', optional: true, type: 'tel', autoComplete: 'tel' },
  { name: 'location', label: 'Postcode or town', optional: true, autoComplete: 'postal-code' },
  { name: 'message', label: 'Message', autoComplete: 'off', multiline: true },
];

const id = (field: string) => `enquiry-${field}`;

// Enquiry form (brief section 8). Works without JavaScript through the server
// action; with JavaScript it validates in the browser first using the same
// rules as the server.
export default function EnquiryForm() {
  const [state, formAction, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: 'idle' });
  const [values, setValues] = useState<EnquiryValues>(() => ('values' in state ? state.values : EMPTY));
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLParagraphElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const errors: FieldErrors = clientErrors ?? (state.status === 'invalid' ? state.errors : {});
  const errorFields = FIELD_CONFIG.filter((f) => errors[f.name]);

  // Time-to-submit check: record when the form was first shown.
  useEffect(() => {
    if (startedRef.current && !startedRef.current.value) startedRef.current.value = String(Date.now());
  }, []);

  // Move focus to the outcome so screen readers announce it.
  useEffect(() => {
    if (state.status === 'invalid') summaryRef.current?.focus();
    if (state.status === 'failed') failedRef.current?.focus();
    if (state.status === 'sent') sentRef.current?.focus();
  }, [state]);

  function update(field: keyof EnquiryValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validate(readValues(new FormData(event.currentTarget)));
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setClientErrors(found);
      requestAnimationFrame(() => summaryRef.current?.focus());
    } else {
      setClientErrors(null);
    }
  }

  if (state.status === 'sent') {
    return (
      <div className={styles.sent} ref={sentRef} tabIndex={-1} role="status">
        <p className={styles.sentHeading}>Thank you{state.name ? `, ${state.name}` : ''}.</p>
        <p>
          We have received your enquiry and will reply using the contact details you gave us. If your enquiry is urgent,
          please call us.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} action={formAction} onSubmit={handleSubmit} noValidate>
      {errorFields.length > 0 && (
        <div className={styles.summary} ref={summaryRef} tabIndex={-1} aria-labelledby="enquiry-summary-heading">
          <p className={styles.summaryHeading} id="enquiry-summary-heading">
            There is a problem
          </p>
          <ul className={styles.summaryList}>
            {errorFields.map((f) => (
              <li key={f.name}>
                <a href={`#${id(f.name)}`}>{errors[f.name]}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.status === 'failed' && (
        <p className={styles.failed} ref={failedRef} tabIndex={-1} role="alert">
          {state.message}
        </p>
      )}

      {FIELD_CONFIG.map((f) => {
        const error = errors[f.name];
        const errorId = `${id(f.name)}-error`;
        const common = {
          id: id(f.name),
          name: f.name,
          className: f.multiline ? `${styles.input} ${styles.textarea}` : styles.input,
          autoComplete: f.autoComplete,
          maxLength: LIMITS[f.name],
          required: !f.optional,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? errorId : undefined,
          value: values[f.name],
          // A blank placeholder lets CSS tell an empty field from a filled one
          // (:placeholder-shown) for the floating labels on phones.
          placeholder: ' ',
        };
        return (
          <div
            className={f.multiline ? `${styles.field} ${styles.fieldMultiline}` : styles.field}
            data-filled={values[f.name] !== ''}
            key={f.name}
          >
            <label className={styles.label} htmlFor={id(f.name)}>
              {f.label}
              {f.optional && <span className={styles.optional}> (optional)</span>}
            </label>
            {error && (
              <p className={styles.error} id={errorId}>
                <span className="visually-hidden">Error: </span>
                {error}
              </p>
            )}
            {f.multiline ? (
              <textarea {...common} rows={6} onChange={(e) => update(f.name, e.target.value)} />
            ) : (
              <input
                {...common}
                type={f.type ?? 'text'}
                inputMode={f.type === 'tel' ? 'tel' : undefined}
                onChange={(e) => update(f.name, e.target.value)}
              />
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive technology. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={id(HONEYPOT_FIELD)}>Leave this field empty</label>
        <input id={id(HONEYPOT_FIELD)} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name={STARTED_FIELD} />

      {SHOW_MARKETING_OPT_IN && (
        <div className={styles.checkboxField}>
          <input
            className={styles.checkbox}
            id={id('marketing')}
            name="marketing"
            type="checkbox"
            value="yes"
            checked={values.marketing}
            onChange={(e) => update('marketing', e.target.checked)}
          />
          <label className={styles.checkboxLabel} htmlFor={id('marketing')}>
            Send me occasional emails about {siteName}&rsquo;s services and projects. This is optional, and you can
            unsubscribe at any time.
          </label>
        </div>
      )}

      <p className={styles.notice}>
        Your details will go to {siteName}. We will use them only to reply to your enquiry. Read our{' '}
        <Link href="/contact-us/privacy-policy/">privacy notice</Link> to find out how we look after your information.
      </p>

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? 'Sending' : 'Submit'}
      </button>
    </form>
  );
}
