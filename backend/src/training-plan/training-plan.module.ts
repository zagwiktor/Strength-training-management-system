import { Module } from '@nestjs/common';
import { TrainingPlanService } from './training-plan.service';
import { TrainingPlanController } from './training-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training-plan.entity';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UserModule } from 'src/user/user.module';
import { TrainingUnitModule } from 'src/training-unit/training-unit.module';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingPlan]), AuthorizationModule, UserModule, TrainingUnitModule],
  controllers: [TrainingPlanController],
  providers: [TrainingPlanService],
  exports: [TrainingPlanService]
})
export class TrainingPlanModule {}
