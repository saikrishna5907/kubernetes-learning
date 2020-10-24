import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@saitickets/common';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }
    const user = User.build({ email, password });
    await user.save();

    //generate jwt
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      // ! is to let typescript know that jwt_key is 100% defined
      process.env.JWT_KEY!
    );
    //store on session object
    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(user);
  }
);

export { router as signupRouter };
