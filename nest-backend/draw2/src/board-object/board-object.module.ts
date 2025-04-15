import { Module } from '@nestjs/common';
import { BoardObjectService } from './board-object.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardObject, BoardObjectSchema } from './schemas/boardObject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoardObject.name, schema: BoardObjectSchema },
    ]),
  ],
  providers: [BoardObjectService],
  exports: [BoardObjectService, MongooseModule],
})
export class BoardObjectModule {}
