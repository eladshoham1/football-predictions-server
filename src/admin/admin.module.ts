import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { ScoringModule } from '../scoring/scoring.module'
import { AdminGuard } from '../guards/admin.guard'

@Module({
  imports: [PrismaModule, AuthModule, ScoringModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
