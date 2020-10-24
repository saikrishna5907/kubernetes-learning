import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@saitickets/common';
const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };
