import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import { Contract, type ContractId } from '#src/insurance/domain/contract/contract.ts';
import type { ContractRepository } from '#src/insurance/domain/ports/contract-repository.port.ts';

export class InMemoryContractRepository implements ContractRepository {
  snapshots = new Map<ContractId, Contract>();

  async listByCompanyId(companyId: CompanyId) {
    return (await this.list()).filter((contract) => contract.companyId === companyId);
  }

  async list() {
    return [...this.snapshots.values()]
      .toSorted((left, right) =>
        right
          .getProps()
          .startOn.toString()
          .localeCompare(left.getProps().startOn.toString()),
      )
      .map((contract) => Contract.hydrate({ ...contract.getProps() }, contract.id));
  }

  async save(contract: Contract) {
    this.snapshots.set(
      contract.id,
      Contract.hydrate({ ...contract.getProps() }, contract.id),
    );
  }
}
