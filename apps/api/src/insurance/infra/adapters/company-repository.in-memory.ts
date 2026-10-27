import { Company, type CompanyId } from '#src/insurance/domain/company/company.ts';
import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';

export class InMemoryCompanyRepository implements CompanyRepository {
  snapshots = new Map<CompanyId, Company>();

  async findById(id: CompanyId) {
    const company = this.snapshots.get(id);

    return company ? this.clone(company) : null;
  }

  async findByRegistrationNumber(registrationNumber: string) {
    const company = [...this.snapshots.values()].find(
      (stored) => stored.registrationNumber === registrationNumber,
    );

    return company ? this.clone(company) : null;
  }

  async list() {
    return [...this.snapshots.values()]
      .toSorted(
        (left, right) =>
          right.getProps().createdAt.getTime() - left.getProps().createdAt.getTime(),
      )
      .map((company) => this.clone(company));
  }

  async save(company: Company) {
    this.snapshots.set(company.id, this.clone(company));
  }

  private clone(company: Company) {
    return Company.hydrate({ ...company.getProps() }, company.id);
  }
}
