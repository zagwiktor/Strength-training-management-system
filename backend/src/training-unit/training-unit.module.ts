import { Module } from '@nestjs/common';
import { TrainingUnitService } from './training-unit.service';
import { TrainingUnitController } from './training-unit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingUnit } from './entities/training-unit.entity';
import { Exercise } from 'src/exercise/entities/exercise.entity';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingUnit]),AuthorizationModule, UserModule, ExerciseModule],
  controllers: [TrainingUnitController],
  providers: [TrainingUnitService],
  exports: [TrainingUnitService]
})
export class TrainingUnitModule {}
