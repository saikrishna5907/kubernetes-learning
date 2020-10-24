import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
it('fetched the order', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'asdasd',
    price: 12,
  });
  await ticket.save();
  const user = global.signin();

  const { body: Order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${Order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);

  expect(fetchedOrder.id).toEqual(Order.id);
});

it("returns an error if one user tries to access another user's orders", async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'asdasd',
    price: 12,
  });
  await ticket.save();
  const user = global.signin();

  const { body: Order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${Order.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(401);
});
