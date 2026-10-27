import type { DomainEvent, DomainEventClass } from '#src/core/primitives/domain-event.ts';

export type EventHandler<Event extends DomainEvent> = (event: Event) => Promise<void>;

export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
  subscribe<Event extends DomainEvent>(
    eventClass: DomainEventClass<Event>,
    handler: EventHandler<Event>,
  ): void;
}
