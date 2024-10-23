import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UserModule } from 'src/user/user.module';
import { ExerciseCategoryModule } from 'src/exercise-category/exercise-category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), AuthorizationModule, UserModule, ExerciseCategoryModule],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService]
})
export class ExerciseModule {}
