import { type FormEvent, type ReactNode, useEffect, useRef } from 'react';

import { Button } from '@/components/Button/Button';

import styles from './Modal.module.css';

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  /** When set, the body is a form and the footer gets a submit button. */
  onSubmit?: () => void;
  submitLabel?: string;
  submitting?: boolean;
  children: ReactNode;
};

export function Modal({
  title,
  open,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  submitting = false,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) {
      dialog?.showModal();
    }
    if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {onSubmit && (
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : submitLabel}
            </Button>
          )}
        </footer>
      </form>
    </dialog>
  );
}
