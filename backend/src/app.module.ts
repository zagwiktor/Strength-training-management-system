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
import { RemovePasswordInterceptor } from './interceptors/remove-password/remove-password.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TrainingUnitModule } from './training-unit/training-unit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  }),
  DatabaseModule,
  UserModule,
  ExerciseModule,
  RaportModule,
  ExerciseCategoryModule,
  AuthorizationModule,
  DietModule,
  TrainingPlanModule,
  TrainingUnitModule
],
  controllers: [AppController],
  providers: [AppService, 
    {
      provide: APP_INTERCEPTOR,
      useClass: RemovePasswordInterceptor
    },
  ],
})
export class AppModule {}
