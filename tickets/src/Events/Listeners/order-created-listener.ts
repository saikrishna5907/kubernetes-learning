import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  Subjects,
} from '@saitickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../Publishers/ticket-updated-publisher';
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    ticket.set({ orderId: data.id });
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: +ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });
    msg.ack();
  }
}
