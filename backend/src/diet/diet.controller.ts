import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { DietService } from './diet.service';
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';
import { AuthGuard } from 'src/authorization/auth.guard';

@Controller('diet')
@UseGuards(AuthGuard)
export class DietController {
  constructor(private readonly dietService: DietService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  create(@Body() createDietDto: CreateDietDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.dietService.create(createDietDto, userId);
  }

  @Get('get')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  findAll(@Req() request) {
    const userId = request.decodedData.sub;
    return this.dietService.findAll(userId);
  }

  @Get('get/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  findOne(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.dietService.findOne(+id, userId);
  }

  @Patch('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  update(@Param('id') id: string, @Body() updateDietDto: UpdateDietDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.dietService.update(+id, updateDietDto, userId);
  }

  @Delete('delete/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  remove(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.dietService.remove(+id, userId);
  }
}
