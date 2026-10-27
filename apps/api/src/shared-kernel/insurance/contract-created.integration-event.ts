import { z } from 'zod';

import { IntegrationEvent } from '#src/core/primitives/integration-event.ts';

export const ContractCreatedIntegrationEventPayload = z.object({
  contractId: z.string(),
  companyId: z.string(),
  companyName: z.string(),
  units: z.int().positive(),
  /** Minor units. */
  unitPriceAmount: z.int().positive(),
  /** Minor units: `units * unitPriceAmount`. */
  totalAmount: z.int().positive(),
  currency: z.string(),
  startOn: z.iso.date(),
  endOn: z.iso.date(),
});
export type ContractCreatedIntegrationEventPayload = z.output<
  typeof ContractCreatedIntegrationEventPayload
>;

/** A company accepted a quote and is now covered by a contract. */
export class ContractCreatedIntegrationEvent extends IntegrationEvent<ContractCreatedIntegrationEventPayload> {
  static override readonly type = 'insurance.contract-created';
  static override readonly payloadSchema = ContractCreatedIntegrationEventPayload;
}
