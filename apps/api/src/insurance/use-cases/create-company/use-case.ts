import { Company } from '#src/insurance/domain/company/company.ts';
import { CompanyError } from '#src/insurance/domain/company/error.ts';
import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';
import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';

export type CreateCompanyCommand = {
  name: string;
  registrationNumber: string;
};

export class CreateCompanyUseCase {
  private readonly companyRepository: CompanyRepository;
  private readonly clock: Clock;
  private readonly idGenerator: IdGenerator;

  constructor(
    companyRepository: CompanyRepository,
    clock: Clock,
    idGenerator: IdGenerator,
  ) {
    this.companyRepository = companyRepository;
    this.clock = clock;
    this.idGenerator = idGenerator;
  }

  async execute(command: CreateCompanyCommand) {
    const company = Company.create(
      { ...command, createdAt: this.clock.now() },
      this.idGenerator.generate(),
    );

    const existing = await this.companyRepository.findByRegistrationNumber(
      company.registrationNumber,
    );
    if (existing) {
      throw new PreconditionFailedError({
        reason: 'a company with this registration number already exists',
        code: CompanyError.RegistrationNumberTaken,
        context: { companyId: existing.id },
      });
    }

    await this.companyRepository.save(company);

    return company;
  }
}
