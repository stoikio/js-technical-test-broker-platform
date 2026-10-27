import type { EventBus } from '#src/core/domain/ports/event-bus.port.ts';
import type { DomainEvent } from '#src/core/primitives/domain-event.ts';

/** Records what a use case publishes, without delivering it. */
export class InMemoryEventBus implements EventBus {
  published: DomainEvent[] = [];

  subscribe() {}

  async publish(events: DomainEvent[]) {
    this.published.push(...events);
  }
}
