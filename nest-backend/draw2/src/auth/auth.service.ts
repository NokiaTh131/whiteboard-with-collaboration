/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from 'src/auth/dto/authentication.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const result = user.toObject();
      return {
        email: result.email,
        id: result._id,
      };
    }
    return null;
  }

  async login(user: LoginDTO) {
    const login_user = await this.userService.findByEmail(user.email);
    const token = this.generateToken(login_user);
    if (!login_user) {
      return {
        message: 'login fail',
      };
    }
    return {
      user: {
        id: login_user._id,
        username: login_user.username,
        email: login_user.email,
      },
      token,
    };
  }

  async register(registerDTO: RegisterDTO) {
    const { username, email, password } = registerDTO;

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      return {
        message: 'register fail',
      };
    }

    const newUser = new this.userModel({
      username,
      email,
      passwordHash: password,
    });

    await newUser.save();
    const token = this.generateToken(newUser);

    return {
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    };
  }

  private generateToken(user: any) {
    const payload = { email: user.email, id: user._id };
    return this.jwtService.sign(payload);
  }
}
