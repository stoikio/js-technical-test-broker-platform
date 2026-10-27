import type { Params } from 'react-router';

import { useCompany } from '@/api/companies';

/** Breadcrumb label of a company route: the company name once loaded. */
export function CompanyCrumb({ params }: { params: Params }) {
  const company = useCompany(params.companyId ?? '');

  return <>{company.data?.name ?? 'Company'}</>;
}
