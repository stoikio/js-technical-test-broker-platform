import type { EventBus, EventHandler } from '#src/core/domain/ports/event-bus.port.ts';
import type { DomainEvent, DomainEventClass } from '#src/core/primitives/domain-event.ts';

/**
 * Delivers events synchronously to the handlers registered in this process. Handlers run
 * inside the publisher's transaction, so a failing handler rolls the publisher back too.
 */
export class InProcessEventBus implements EventBus {
  private readonly handlers = new Map<string, EventHandler<DomainEvent>[]>();

  subscribe<Event extends DomainEvent>(
    eventClass: DomainEventClass<Event>,
    handler: EventHandler<Event>,
  ) {
    const handlers = this.handlers.get(eventClass.type) ?? [];
    handlers.push(handler as EventHandler<DomainEvent>);
    this.handlers.set(eventClass.type, handlers);
  }

  async publish(events: DomainEvent[]) {
    for (const event of events) {
      for (const handler of this.handlers.get(event.type) ?? []) {
        await handler(event);
      }
    }
  }
}
