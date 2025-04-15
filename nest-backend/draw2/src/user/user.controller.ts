import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SearchUserDto } from './dto/user.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Post('search')
  async searchUser(@Body() searchUserDto: SearchUserDto) {
    return await this.userService.searchUsers({
      email: searchUserDto.email,
    });
  }
}
