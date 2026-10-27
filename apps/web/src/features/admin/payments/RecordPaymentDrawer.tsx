import { useNavigate } from 'react-router';

import { Drawer, DrawerSection } from '@/components/Drawer/Drawer';

import { RecordPaymentForm } from './RecordPaymentForm';

export function RecordPaymentDrawer() {
  const navigate = useNavigate();

  return (
    <Drawer
      preTitle="Payment"
      title="Record a payment"
      onClose={() => navigate('/admin/payments')}
    >
      <DrawerSection title="Payment">
        <RecordPaymentForm onRecorded={() => navigate('/admin/payments')} />
      </DrawerSection>
    </Drawer>
  );
}
