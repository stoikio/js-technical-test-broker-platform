import { useState } from 'react';

import { useApplyPayment, usePayments } from '@/api/billing';
import { errorMessage } from '@/api/client';
import type { Invoice } from '@/api/types';
import { FormError, SelectField, TextField } from '@/components/FormField/FormField';
import { Modal } from '@/components/Modal/Modal';
import { formatDate, formatMoney } from '@/utils/format';
import { parseAmountInput, toAmountInput } from '@/utils/money';

import { applicableAmount } from './applicable-amount';

type ApplyPaymentModalProps = {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
};

export function ApplyPaymentModal({ invoice, open, onClose }: ApplyPaymentModalProps) {
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
    const payment = available.find((option) => option.id === id);
    setAmount(
      payment
        ? toAmountInput(applicableAmount(payment.unappliedAmount.amount, invoice))
        : '',
    );
  };

  const close = () => {
    applyPayment.reset();
    setFormError(null);
    setPaymentId('');
    setAmount('');
    onClose();
  };

  const submit = () => {
    const parsedAmount = parseAmountInput(amount);
    if (!paymentId || parsedAmount === null || parsedAmount === 0) {
      setFormError('Choose a payment and a non-zero amount');
      return;
    }
    setFormError(null);
    applyPayment.mutate(
      { paymentId, invoiceId: invoice.id, amount: parsedAmount },
      { onSuccess: close, onError: (error) => setFormError(errorMessage(error)) },
    );
  };

  return (
    <Modal
      title={`Apply a payment to ${invoice.number}`}
      open={open}
      onClose={close}
      onSubmit={submit}
      submitLabel="Apply"
      submitting={applyPayment.isPending}
    >
      <SelectField
        label="Payment"
        placeholder={
          available.length > 0 ? 'Choose a payment' : 'No payment left to apply'
        }
        value={paymentId}
        onChange={(event) => selectPayment(event.target.value)}
        options={available.map((payment) => ({
          value: payment.id,
          label: `${formatDate(payment.receivedOn)}: ${formatMoney(payment.unappliedAmount)} left of ${formatMoney(payment.amount)}`,
        }))}
        required
      />
      <TextField
        label="Amount to apply (EUR)"
        inputMode="decimal"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        hint={`Outstanding on this invoice: ${formatMoney(invoice.outstandingAmount)}`}
        required
      />
      <FormError error={formError} />
    </Modal>
  );
}
