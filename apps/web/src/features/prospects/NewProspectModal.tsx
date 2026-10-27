import { useState } from 'react';
import { useNavigate } from 'react-router';

import { errorMessage } from '@/api/client';
import { useCreateCompany } from '@/api/companies';
import { FormError, TextField } from '@/components/FormField/FormField';
import { Modal } from '@/components/Modal/Modal';

export function NewProspectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const createCompany = useCreateCompany();
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const close = () => {
    createCompany.reset();
    onClose();
  };

  const submit = () => {
    createCompany.mutate(
      { name, registrationNumber },
      { onSuccess: (company) => navigate(`/prospects/${company.id}`) },
    );
  };

  return (
    <Modal
      title="New prospect"
      open={open}
      onClose={close}
      onSubmit={submit}
      submitLabel="Create prospect"
      submitting={createCompany.isPending}
    >
      <TextField
        label="Company name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        autoFocus
      />
      <TextField
        label="Registration number"
        hint="5 to 20 letters, digits or dashes."
        value={registrationNumber}
        onChange={(event) => setRegistrationNumber(event.target.value)}
        required
      />
      <FormError
        error={createCompany.isError ? errorMessage(createCompany.error) : null}
      />
    </Modal>
  );
}
