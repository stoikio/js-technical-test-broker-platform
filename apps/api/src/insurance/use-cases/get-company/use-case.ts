import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';

export type GetCompanyQuery = { companyId: CompanyId };

export class GetCompanyUseCase {
  private readonly companyRepository: CompanyRepository;

  constructor(companyRepository: CompanyRepository) {
    this.companyRepository = companyRepository;
  }

  async execute({ companyId }: GetCompanyQuery) {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new ResourceNotFoundError({ resourceName: 'Company', resourceId: companyId });
    }

    return company;
  }
}
