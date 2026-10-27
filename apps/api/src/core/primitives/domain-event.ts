type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue };

export type DomainEventPayload = { [key: string]: JsonValue };

export type DomainEventProps<Payload extends DomainEventPayload> = {
  id: string;
  aggregateId: string;
  occurredAt: Date;
  payload: Payload;
};

/**
 * Something that happened in a context. Payloads are plain JSON so an event can be
 * logged, stored or sent elsewhere without a mapper: carry dates as ISO strings and
 * money as minor units.
 */
export abstract class DomainEvent<
  Payload extends DomainEventPayload = DomainEventPayload,
> {
  /** Every concrete event declares its own `static readonly type`. */
  declare static readonly type: string;

  readonly type: string = (this.constructor as typeof DomainEvent).type;
  readonly id: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly payload: Payload;

  constructor(props: DomainEventProps<Payload>) {
    this.id = props.id;
    this.aggregateId = props.aggregateId;
    this.occurredAt = props.occurredAt;
    this.payload = props.payload;
  }
}

export type DomainEventClass<Event extends DomainEvent> = {
  readonly type: string;
  new (props: DomainEventProps<Event['payload']>): Event;
};
