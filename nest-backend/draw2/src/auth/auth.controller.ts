/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from 'src/auth/dto/authentication.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(
    @Body() registerDTO: RegisterDTO,
    @Res({ passthrough: true }) res,
  ) {
    const user = await this.authService.register(registerDTO);
    res.cookie('token', user.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return user.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const user = await this.authService.login(req.user);
    res.cookie('token', user.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return user.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return { message: 'Logged out' };
  }
}
