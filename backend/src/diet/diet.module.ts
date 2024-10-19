import { Module } from '@nestjs/common';
import { DietService } from './diet.service';
import { DietController } from './diet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diet } from './entities/diet.entity';
import { UserModule } from 'src/user/user.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([Diet]), UserModule, AuthorizationModule],
  controllers: [DietController],
  providers: [DietService],
})
export class DietModule {}
