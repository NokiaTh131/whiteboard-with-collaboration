/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import {
  CreateBoardDto,
  InviteUserDto,
  UpdateBoardDto,
  RemoveUserDto,
} from './dto/board.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('api/boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBoard(@Request() req, @Body() createBoardDto: CreateBoardDto) {
    const userId = req.user.id as string;
    return this.boardService.createBoard(createBoardDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getBoards(@Request() req) {
    const userId = req.user.id as string;
    return this.boardService.getUserBoards(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getBoard(@Request() req, @Param('id') boardId) {
    const userId = req.user.id as string;
    return this.boardService.getBoardDetails(boardId as string, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateBoard(
    @Request() req,
    @Param('id') boardId,
    @Body() updareboardDto: UpdateBoardDto,
  ) {
    const userId = req.user.id as string;
    return this.boardService.updateBoard(
      boardId as string,
      userId,
      updareboardDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/invite')
  async inviteUser(
    @Request() req,
    @Param('id') boardId,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    const inviterId = req.user.id as string;
    return this.boardService.inviteUserToBoard(
      boardId as string,
      inviteUserDto,
      inviterId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/remove')
  async removeUser(
    @Request() req,
    @Param('id') boardId,
    @Body() removeUserDto: RemoveUserDto,
  ) {
    const removerId = req.user.id as string;
    return this.boardService.removeUserFromBoard(
      boardId as string,
      removeUserDto.userId,
      removerId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeBoard(@Request() req, @Param('id') boardId) {
    const userId = req.user.id as string;

    return this.boardService.deleteBoard(boardId as string, userId);
  }
}
