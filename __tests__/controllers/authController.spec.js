import {
  register, login, logout, getMe, updateDetails, UpdatePassword
} from '@controllers/authController.js';
import User from '@models/User';
import asyncHandler from '@middlewares/async';
import { connect, disconnect } from '../utils/mongoose';

describe('The Auth controller', () => {
  const user = {
    firstName: 'Super',
    lastName: 'User',
    email: 'test123@test.com',
    password: 'password'

  };

  let CreatedUser;

  beforeAll(async () => {
    connect();
    await User.deleteMany();
  });


  afterAll(() => {
    disconnect();
  });
});
