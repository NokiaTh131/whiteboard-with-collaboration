import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { PermissionModule } from './permission/permission.module';
import { BoardObjectModule } from './board-object/board-object.module';
import { SocketServiceGateway } from './socket-service/socket-service.gateway';
import { ParticipantsModule } from './participants/participants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/defaultdb',
    ),
    UserModule,
    AuthModule,
    BoardModule,
    PermissionModule,
    BoardObjectModule,
    ParticipantsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SocketServiceGateway],
})
export class AppModule {}
