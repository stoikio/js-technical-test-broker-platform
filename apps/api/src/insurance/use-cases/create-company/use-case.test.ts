import { beforeEach, describe, it } from 'vitest';

import { CompanyError } from '#src/insurance/domain/company/error.ts';
import { InsuranceFixture } from '#src/insurance/tests/fixtures/insurance.fixture.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';
import { ValueObjectError } from '#src/core/errors/value-object.error.ts';

const COMPANY_ID = '0f1e2d3c-4b5a-4968-8776-655443322110';

describe('CreateCompany', () => {
  let fixture: InsuranceFixture;

  beforeEach(() => {
    fixture = new InsuranceFixture();
  });

  it('normalizes the registration number', async () => {
    fixture.givenTheNextIdsAre(COMPANY_ID);

    await fixture.whenACompanyIsCreated({
      name: '  Granite Works  ',
      registrationNumber: 'gw 771 204',
    });

    fixture.thenTheCompanyShouldBeSaved({
      id: COMPANY_ID,
      name: 'Granite Works',
      registrationNumber: 'GW771204',
    });
  });

  it('refuses a registration number already in use', async () => {
    fixture.givenACompany({ registrationNumber: 'GW771204' });

    await fixture.whenACompanyIsCreated({
      name: 'Granite Works',
      registrationNumber: 'GW771204',
    });

    fixture.thenItShouldFailWith(PreconditionFailedError, {
      code: CompanyError.RegistrationNumberTaken,
    });
  });

  it('rejects an empty name', async () => {
    await fixture.whenACompanyIsCreated({ name: ' ', registrationNumber: 'GW771204' });

    fixture.thenItShouldFailWith(ValueObjectError);
  });
});
