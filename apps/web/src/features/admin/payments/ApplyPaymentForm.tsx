import { type FormEvent, useState } from 'react';

import { useApplyPayment, usePayments } from '@/api/billing';
import { errorMessage } from '@/api/client';
import type { Invoice } from '@/api/types';
import { Button } from '@/components/Button/Button';
import {
  FieldRow,
  FormActions,
  FormError,
  SelectField,
  TextField,
} from '@/components/FormField/FormField';
import { formatDate, formatMoney } from '@/utils/format';
import { parseAmountInput, toAmountInput } from '@/utils/money';

import { applicableAmount } from './applicable-amount';
import styles from './PaymentForms.module.css';

/** Applies part of a payment already recorded, and not fully applied yet, to `invoice`. */
export function ApplyPaymentForm({ invoice }: { invoice: Invoice }) {
  const payments = usePayments();
  const applyPayment = useApplyPayment();
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const available = (payments.data ?? []).filter(
    (payment) =>
      payment.unappliedAmount.amount !== 0 &&
      payment.amount.currency === invoice.amount.currency,
  );

  const selectPayment = (id: string) => {
    setPaymentId(id);
    const payment = available.find((item) => item.id === id);
    setAmount(
      payment
        ? toAmountInput(applicableAmount(payment.unappliedAmount.amount, invoice))
        : '',
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = parseAmountInput(amount);
    if (!paymentId || parsedAmount === null || parsedAmount === 0) {
      setFormError('Choose a payment and a non-zero amount');
      return;
    }
    setFormError(null);
    applyPayment.mutate(
      { paymentId, invoiceId: invoice.id, amount: parsedAmount },
      {
        onSuccess: () => {
          setPaymentId('');
          setAmount('');
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  };

  if (payments.isSuccess && available.length === 0) {
    return <p className={styles.hint}>Every recorded payment is fully applied.</p>;
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <FieldRow>
        <SelectField
          label="Payment"
          placeholder="Choose a payment"
          value={paymentId}
          onChange={(event) => selectPayment(event.target.value)}
          options={available.map((payment) => ({
            value: payment.id,
            label: `${formatDate(payment.receivedOn)}, ${formatMoney(payment.unappliedAmount)} left`,
          }))}
          required
        />
        <TextField
          label="Amount to apply (EUR)"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
      </FieldRow>
      <FormError error={formError} />
      <FormActions>
        <Button type="submit" variant="default" loading={applyPayment.isPending}>
          Apply payment
        </Button>
      </FormActions>
    </form>
  );
}
