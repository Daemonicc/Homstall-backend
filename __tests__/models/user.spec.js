/*
* eslint-disable import/no-unresolved
* @jest-environment node
*/
import User from '@models/User';
import { disconnect, connect } from '@test/utils/mongoose';
import Bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

describe('The user model', () => {
  const user = {
    firstName: 'Super',
    lastName: 'User',
    email: 'test123@test.com',
    password: 'password'

  };

  let CreatedUser;

  beforeAll(async () => {
    connect();
    await User.deleteMany({});
    CreatedUser = await User.create(user);
  });

  it('should hash the user password before saving to the database', async () => {
    expect(Bcrypt.compareSync(user.password, CreatedUser.password)).toBe(true);
  });

  it('should generate reset token', async () => {
    const resetToken = CreatedUser.getResetPasswordToken();
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    expect(CreatedUser.resetPasswordToken).toStrictEqual(resetPasswordToken);
  });


  describe('The generate User token', () => {
    it('Should generate a valid jwt for a user', () => {
      const token = CreatedUser.getSignedJwtToken();

      const { id } = jwt.verify(token, 'itsASecret');

      expect(id).toEqual(JSON.parse(JSON.stringify(CreatedUser._id)));
    });
  });

  describe('The reset Token', () => {
    it('Should expire in 10 mins', async () => {
      const resetToken = CreatedUser.getResetPasswordToken();
      const resetTokenExpiry = Date.now() + 10 * 60 * 1000;

      expect(CreatedUser.resetPasswordExpire).toBeDefined();
    });
  });

  afterAll(async () => {
    disconnect();
  });
});
