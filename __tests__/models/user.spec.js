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

  it('should return validation error if email as been taken',async () => {
    const userDulipcate = {
      firstName: 'Super',
      lastName: 'User',
      email: 'test123@test.com',
      password: 'password'
  
    };
    try{
      await User.create(userDulipcate)
    }catch(e){
      expect(e.name).toEqual('MongoError')
      expect(e.errmsg).toEqual(`E11000 duplicate key error collection: homstall_test.users index: email_1 dup key: { : "${userDulipcate.email}" }`)
    }
  })

  it('should return validation error if email is invalid',async () => {
    const userDulipcate = {
      firstName: 'Super',
      lastName: 'User',
      email: 'test123@t.c',
      password: 'password'
  
    };
    try{
      await User.create(userDulipcate)
    }catch(e){
      expect(e.message).toEqual("User validation failed: email: Please add a valid email")
    }
  })

  it('should throw validation error if no first name', async () => {
    const errorUser = {
      lastName: 'User',
      email: 'test123@test.com',
      password: 'password'
  
    };
    try{
      await User.create(errorUser)
    }catch(e){
      expect(e.message).toEqual("User validation failed: firstName: Please add a First name")
    }
  })

  it('should throw validation error if no last name', async () => {
    const errorUser = {
      firstName: 'User',
      email: 'test123@test.com',
      password: 'password'
  
    };
    try{
      await User.create(errorUser)
    }catch(e){
      expect(e.message).toEqual("User validation failed: lastName: Please add a Last name")
    }
  })

  it('should throw validation error if no password is not up to 6 characters', async () => {
    const errorUser = {
      firstName: 'User',
      lastName: 'super',
      email: 'test123@test.com',
      password: 'pass'
  
    };
    try{
      await User.create(errorUser)
    }catch(e){
      expect(e.message).toEqual("User validation failed: password: Path `password` (`pass`) is shorter than the minimum allowed length (6).")
    }
  })


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
