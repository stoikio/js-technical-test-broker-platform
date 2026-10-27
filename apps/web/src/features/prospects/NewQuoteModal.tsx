import { useState } from 'react';

import { errorMessage } from '@/api/client';
import { useCreateQuote } from '@/api/companies';
import { FormError, TextField } from '@/components/FormField/FormField';
import { Modal } from '@/components/Modal/Modal';
import { formatMoney } from '@/utils/format';
import { parseAmountInput } from '@/utils/money';

type NewQuoteModalProps = {
  companyId: string;
  open: boolean;
  onClose: () => void;
};

export function NewQuoteModal({ companyId, open, onClose }: NewQuoteModalProps) {
  const createQuote = useCreateQuote(companyId);
  const [units, setUnits] = useState('10');
  const [unitPrice, setUnitPrice] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const unitCount = Number(units);
  const unitPriceAmount = parseAmountInput(unitPrice);
  const total =
    Number.isInteger(unitCount) && unitPriceAmount !== null
      ? formatMoney({ amount: unitCount * unitPriceAmount, currency: 'EUR' })
      : null;

  const close = () => {
    createQuote.reset();
    setFormError(null);
    onClose();
  };

  const submit = () => {
    if (unitPriceAmount === null || unitPriceAmount <= 0) {
      setFormError('Enter a unit price, for example 120.50');
      return;
    }
    setFormError(null);
    createQuote.mutate(
      { units: unitCount, unitPrice: { amount: unitPriceAmount, currency: 'EUR' } },
      { onSuccess: close },
    );
  };

  return (
    <Modal
      title="New quote"
      open={open}
      onClose={close}
      onSubmit={submit}
      submitLabel="Create quote"
      submitting={createQuote.isPending}
    >
      <TextField
        label="Units"
        type="number"
        min={1}
        step={1}
        value={units}
        onChange={(event) => setUnits(event.target.value)}
        required
      />
      <TextField
        label="Unit price (EUR)"
        inputMode="decimal"
        placeholder="120.00"
        value={unitPrice}
        onChange={(event) => setUnitPrice(event.target.value)}
        hint={total ? `Total: ${total}` : undefined}
        required
      />
      <FormError
        error={
          formError ?? (createQuote.isError ? errorMessage(createQuote.error) : null)
        }
      />
    </Modal>
  );
}
