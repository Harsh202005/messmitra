import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { MessModule } from '../mess/mess.module';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [MessModule, MembersModule],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}
