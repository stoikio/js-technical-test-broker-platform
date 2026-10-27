import type { z } from 'zod';

import {
  DomainEvent,
  type DomainEventPayload,
  type DomainEventProps,
} from '#src/core/primitives/domain-event.ts';

/**
 * The published language one context offers the others. Contracts live in
 * `src/shared-kernel/<producer>/`, so a consumer never imports the producer's internals.
 * The payload is parsed on construction: a producer cannot publish a payload that breaks
 * its own contract.
 */
export abstract class IntegrationEvent<
  Payload extends DomainEventPayload = DomainEventPayload,
> extends DomainEvent<Payload> {
  declare static readonly payloadSchema: z.ZodType<DomainEventPayload>;

  constructor(props: DomainEventProps<Payload>) {
    const { payloadSchema } = new.target as unknown as {
      payloadSchema: z.ZodType<Payload>;
    };

    super({ ...props, payload: payloadSchema.parse(props.payload) });
  }
}
