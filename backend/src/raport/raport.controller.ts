import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Req, Query } from '@nestjs/common';
import { RaportService } from './raport.service';
import { CreateRaportDto } from './dto/create-raport.dto';
import { UpdateRaportDto } from './dto/update-raport.dto';
import { AuthGuard } from 'src/authorization/auth.guard';

@Controller('raports')
@UseGuards(AuthGuard)
export class RaportController {
  constructor(private readonly raportService: RaportService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  create(@Body() createRaportDto: CreateRaportDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.raportService.create(createRaportDto, userId);
  }

  @Get('get')
  findAll(@Query('trainingPlanId') trainingPlanId: number, @Req() request) {
    const userId = request.decodedData.sub;
    return this.raportService.findAll(userId, trainingPlanId);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.raportService.findOne(+id, userId);
  }

  @Patch('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  update(@Param('id') id: string, @Body() updateRaportDto: UpdateRaportDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.raportService.update(+id, updateRaportDto, userId);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.raportService.remove(+id, userId);
  }
}
