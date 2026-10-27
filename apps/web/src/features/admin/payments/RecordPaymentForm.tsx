import { type FormEvent, useState } from 'react';

import { useApplyPayment, useRecordPayment } from '@/api/billing';
import { errorMessage } from '@/api/client';
import type { Invoice } from '@/api/types';
import { Button } from '@/components/Button/Button';
import {
  FieldRow,
  FormActions,
  FormError,
  TextField,
} from '@/components/FormField/FormField';
import { formatMoney, todayIso } from '@/utils/format';
import { parseAmountInput, toAmountInput } from '@/utils/money';

import { applicableAmount } from './applicable-amount';
import styles from './PaymentForms.module.css';

type RecordPaymentFormProps = {
  /** When set, the recorded payment is applied to this invoice right away. */
  invoice?: Invoice;
  onRecorded?: () => void;
};

export function RecordPaymentForm({ invoice, onRecorded }: RecordPaymentFormProps) {
  const recordPayment = useRecordPayment();
  const applyPayment = useApplyPayment();
  const defaultAmount = invoice ? toAmountInput(invoice.outstandingAmount.amount) : '';
  const [amount, setAmount] = useState(defaultAmount);
  const [receivedOn, setReceivedOn] = useState(todayIso());
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setConfirmation(null);
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount === null || parsedAmount === 0) {
      setFormError('Enter a non-zero amount, for example 250.00 or -80.00');
      return;
    }
    setFormError(null);

    try {
      const currency = invoice?.amount.currency ?? 'EUR';
      const payment = await recordPayment.mutateAsync({
        amount: { amount: parsedAmount, currency },
        receivedOn,
      });
      const toApply = invoice ? applicableAmount(parsedAmount, invoice) : 0;
      if (invoice && toApply !== 0) {
        await applyPayment.mutateAsync({
          paymentId: payment.id,
          invoiceId: invoice.id,
          amount: toApply,
        });
      }
      setConfirmation(
        invoice
          ? `${formatMoney(payment.amount)} recorded, ${formatMoney({ amount: toApply, currency })} applied to ${invoice.number}.`
          : `${formatMoney(payment.amount)} recorded.`,
      );
      setAmount('');
      onRecorded?.();
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <FieldRow>
        <TextField
          label="Amount (EUR)"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <TextField
          label="Received on"
          type="date"
          max={todayIso()}
          value={receivedOn}
          onChange={(event) => setReceivedOn(event.target.value)}
          required
        />
      </FieldRow>
      <p className={styles.hint}>
        A negative amount records money paid out, such as a refund.
        {invoice &&
          ' What the invoice can take is applied to it, the rest stays left to apply.'}
      </p>
      <FormError error={formError} />
      {confirmation && <p className={styles.confirmation}>{confirmation}</p>}
      <FormActions>
        <Button type="submit" loading={recordPayment.isPending || applyPayment.isPending}>
          {invoice ? 'Record and apply' : 'Record payment'}
        </Button>
      </FormActions>
    </form>
  );
}
