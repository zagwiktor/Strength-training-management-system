import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ExerciseModule } from './exercise/exercise.module';
import { RaportModule } from './raport/raport.module';
import { ExerciseCategoryModule } from './exercise-category/exercise-category.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { DietModule } from './diet/diet.module';
import { TrainingPlanModule } from './training-plan/training-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
  }),
  DatabaseModule,
  UserModule,
  ExerciseModule,
  RaportModule,
  ExerciseCategoryModule,
  AuthorizationModule,
  DietModule,
  TrainingPlanModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
