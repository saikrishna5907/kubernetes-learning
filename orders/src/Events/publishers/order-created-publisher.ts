import { Subjects, Publisher, OrderCreatedEvent } from '@saitickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
