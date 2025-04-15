import { forwardRef, Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './schemas/board.schema';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionModule } from 'src/permission/permission.module';
import { BoardObjectModule } from 'src/board-object/board-object.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BoardObjectModule,
    forwardRef(() => PermissionModule),
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
  ],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService, MongooseModule],
})
export class BoardModule {}
