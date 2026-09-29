'use client';

import { useState } from 'react';
import type { ConsentCategory } from '../../lib/consent/config';
import { categories } from '../../lib/consent/config';
import type { ConsentCategories } from './consent';
import styles from './Consent.module.css';

type Props = {
  optional: ConsentCategory[];
  initial: ConsentCategories;
  onSave: (categories: ConsentCategories) => void;
  idPrefix: string;
};

// Category choices: strictly necessary is always on; every optional category
// is a labelled checkbox, never ticked in advance unless the visitor chose it.
// (LHM used unlabelled toggle switches with a hidden input; these are native
// checkboxes with visible labels and focus.)
export default function Preferences({ optional, initial, onSave, idPrefix }: Props) {
  const [choices, setChoices] = useState<ConsentCategories>(initial);
  const necessary = categories.find((c) => c.alwaysOn);

  return (
    <form
      className={styles.prefs}
      onSubmit={(e) => {
        e.preventDefault();
        onSave(choices);
      }}
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Choose which cookies we can use</legend>
        {necessary && (
          <div className={styles.pref}>
            <span className={styles.always}>Always on</span>
            <div>
              <p className={styles.prefName}>{necessary.label}</p>
              <p className={styles.prefDesc}>{necessary.description}</p>
            </div>
          </div>
        )}
        {optional.map((c) => {
          const key = c.id as 'analytics' | 'marketing';
          const id = `${idPrefix}-${c.id}`;
          return (
            <div className={styles.pref} key={c.id}>
              <input
                className={styles.checkbox}
                type="checkbox"
                id={id}
                checked={choices[key]}
                aria-describedby={`${id}-desc`}
                onChange={(e) => setChoices((current) => ({ ...current, [key]: e.target.checked }))}
              />
              <div>
                <label className={styles.prefName} htmlFor={id}>
                  {c.label}
                </label>
                <p className={styles.prefDesc} id={`${id}-desc`}>
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </fieldset>
      <button className={styles.choice} type="submit">
        Save choices
      </button>
    </form>
  );
}
