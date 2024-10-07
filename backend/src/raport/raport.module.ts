import { Module } from '@nestjs/common';
import { RaportService } from './raport.service';
import { RaportController } from './raport.controller';

@Module({
  controllers: [RaportController],
  providers: [RaportService],
})
export class RaportModule {}
