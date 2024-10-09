import { Module } from '@nestjs/common';
import { ExerciseCategoryService } from './exercise-category.service';
import { ExerciseCategoryController } from './exercise-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseCategory } from './entities/exercise-category.entity';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseCategory]), AuthorizationModule, UserModule],
  controllers: [ExerciseCategoryController],
  providers: [ExerciseCategoryService],
})
export class ExerciseCategoryModule {}
