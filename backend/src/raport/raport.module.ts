import { Module } from '@nestjs/common';
import { RaportService } from './raport.service';
import { RaportController } from './raport.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raport } from './entities/raport.entity';
import { UserModule } from 'src/user/user.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { TrainingPlanModule } from 'src/training-plan/training-plan.module';

@Module({
  imports: [TypeOrmModule.forFeature([Raport]), UserModule, AuthorizationModule, TrainingPlanModule],
  controllers: [RaportController],
  providers: [RaportService],
})
export class RaportModule {}
