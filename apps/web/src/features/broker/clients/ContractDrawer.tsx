import { useNavigate, useParams } from 'react-router';

import { useInvoices } from '@/api/billing';
import { useCompany, useCompanyContracts } from '@/api/companies';
import { DescriptionList } from '@/components/DescriptionList/DescriptionList';
import { Drawer, DrawerSection } from '@/components/Drawer/Drawer';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { DueDate } from '@/features/shared/DueDate';
import { PaymentStateBadge } from '@/features/shared/PaymentStateBadge';
import { formatDate, formatMoney } from '@/utils/format';

import { ContractStatusBadge } from './ContractStatusBadge';

export function ContractDrawer() {
  const { companyId = '', contractId = '' } = useParams();
  const navigate = useNavigate();
  const company = useCompany(companyId);
  const contracts = useCompanyContracts(companyId);
  const invoices = useInvoices({ companyId });
  const contract = contracts.data?.find((item) => item.id === contractId);
  const invoice = invoices.data?.find((item) => item.contractId === contractId);

  return (
    <Drawer
      preTitle="Contract"
      title={company.data?.name ?? 'Contract'}
      titleExtra={contract && <ContractStatusBadge contract={contract} />}
      onClose={() => navigate(`/broker/clients/${companyId}`)}
    >
      <QueryBoundary query={contracts}>
        {() =>
          contract ? (
            <>
              <DrawerSection title="Coverage">
                <DescriptionList
                  layout="rows"
                  items={[
                    { label: 'Start date', value: formatDate(contract.startOn) },
                    { label: 'End date', value: formatDate(contract.endOn) },
                    { label: 'Units', value: contract.units },
                    { label: 'Unit price', value: formatMoney(contract.unitPrice) },
                    { label: 'Annual total', value: formatMoney(contract.total) },
                  ]}
                />
              </DrawerSection>
              <DrawerSection title="Invoice">
                {invoice ? (
                  <DescriptionList
                    layout="rows"
                    items={[
                      { label: 'Number', value: invoice.number },
                      { label: 'Amount', value: formatMoney(invoice.amount) },
                      { label: 'Due', value: <DueDate invoice={invoice} /> },
                      { label: 'Paid', value: formatMoney(invoice.paidAmount) },
                      {
                        label: 'Payment',
                        value: <PaymentStateBadge state={invoice.paymentState} />,
                      },
                    ]}
                  />
                ) : (
                  <p>No invoice issued for this contract.</p>
                )}
              </DrawerSection>
            </>
          ) : (
            <DrawerSection title="Coverage">
              <p>This contract does not exist.</p>
            </DrawerSection>
          )
        }
      </QueryBoundary>
    </Drawer>
  );
}
