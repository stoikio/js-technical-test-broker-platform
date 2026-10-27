import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { useId } from 'react';

import styles from './FormField.module.css';

type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: string | null;
};

type FieldShellProps = FieldProps & {
  id: string;
  children: ReactNode;
};

function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        hint && <p className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}

type TextFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>;

/** Any `<input>`: text, number, date. */
export function TextField({ label, hint, error, ...inputProps }: TextFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className={styles.control}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
    </FieldShell>
  );
}

type SelectFieldProps = FieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  };

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  ...selectProps
}: SelectFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        className={styles.control}
        aria-invalid={Boolean(error)}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** A server or form-level error, shown above the submit button. */
export function FormError({ error }: { error: string | null }) {
  return error ? <p className={styles.formError}>{error}</p> : null;
}
