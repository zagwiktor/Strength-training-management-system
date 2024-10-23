import { Module } from '@nestjs/common';
import { TrainingPlanService } from './training-plan.service';
import { TrainingPlanController } from './training-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training-plan.entity';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UserModule } from 'src/user/user.module';
import { ExerciseModule } from 'src/exercise/exercise.module';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingPlan]), AuthorizationModule, UserModule, ExerciseModule],
  controllers: [TrainingPlanController],
  providers: [TrainingPlanService],
})
export class TrainingPlanModule {}
