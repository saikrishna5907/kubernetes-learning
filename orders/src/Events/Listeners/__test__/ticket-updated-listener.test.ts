import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@saitickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'dasdasda',
    price: 10,
  });
  await ticket.save();
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'new asd',
    version: ticket.version + 1,
    price: 1000,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('finds and updates and save a ticket', async () => {
  const { msg, data, listener, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});
it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event a future version number', async () => {
  const { msg, data, listener } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
