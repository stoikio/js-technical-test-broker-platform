import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { useId } from 'react';

import { Icon } from '@/components/Icon/Icon';

import styles from './FormField.module.css';

type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: string | null;
};

type FieldShellProps = FieldProps & {
  id: string;
  required?: boolean;
  children: ReactNode;
};

function FieldShell({ id, label, hint, error, required, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
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
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={inputProps.required}
    >
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
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={selectProps.required}
    >
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
  return error ? (
    <p className={styles.formError} role="alert">
      <Icon name="alert" size={18} />
      {error}
    </p>
  ) : null;
}

/** Lays fields out side by side, wrapping on narrow screens. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className={styles.fieldRow}>{children}</div>;
}

/** Buttons at the end of an inline form, aligned right. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
