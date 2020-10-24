import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@saitickets/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../Events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;
router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => {
        mongoose.Types.ObjectId.isValid(input);
      })
      .withMessage('Ticket id must be valid'),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    const isReserved = await ticket.isReserved();
    // code to see if ticket is reserved
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    const order = await Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });
    await order.save();
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price.toString(),
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
