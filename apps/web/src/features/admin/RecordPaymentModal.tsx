import { useState } from 'react';

import { useApplyPayment, useRecordPayment } from '@/api/billing';
import { errorMessage } from '@/api/client';
import type { Invoice } from '@/api/types';
import { FormError, TextField } from '@/components/FormField/FormField';
import { Modal } from '@/components/Modal/Modal';
import { todayIso } from '@/utils/format';
import { parseAmountInput, toAmountInput } from '@/utils/money';

import { applicableAmount } from './applicable-amount';

type RecordPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  /** When set, the recorded payment is applied to this invoice right away. */
  invoice?: Invoice;
};

export function RecordPaymentModal({ open, onClose, invoice }: RecordPaymentModalProps) {
  const recordPayment = useRecordPayment();
  const applyPayment = useApplyPayment();
  const [amount, setAmount] = useState(
    invoice ? toAmountInput(invoice.outstandingAmount.amount) : '',
  );
  const [receivedOn, setReceivedOn] = useState(todayIso());
  const [formError, setFormError] = useState<string | null>(null);

  const close = () => {
    recordPayment.reset();
    applyPayment.reset();
    setFormError(null);
    onClose();
  };

  const submit = async () => {
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount === null || parsedAmount === 0) {
      setFormError('Enter a non-zero amount, for example 250.00 or -80.00');
      return;
    }
    setFormError(null);

    try {
      const payment = await recordPayment.mutateAsync({
        amount: { amount: parsedAmount, currency: invoice?.amount.currency ?? 'EUR' },
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
      close();
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  return (
    <Modal
      title={invoice ? `Record a payment for ${invoice.number}` : 'Record a payment'}
      open={open}
      onClose={close}
      onSubmit={submit}
      submitLabel="Record payment"
      submitting={recordPayment.isPending || applyPayment.isPending}
    >
      <TextField
        label="Amount (EUR)"
        inputMode="decimal"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        hint="Use a negative amount for money paid out, such as a refund."
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
      <FormError error={formError} />
    </Modal>
  );
}
