import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@saitickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

import mongoose from 'mongoose';
const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new Error('Order ID is invalid');
    }
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
