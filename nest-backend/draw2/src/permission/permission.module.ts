import { forwardRef, Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { BoardModule } from 'src/board/board.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => BoardModule), UserModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
