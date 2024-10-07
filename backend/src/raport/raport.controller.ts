import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RaportService } from './raport.service';
import { CreateRaportDto } from './dto/create-raport.dto';
import { UpdateRaportDto } from './dto/update-raport.dto';

@Controller('raport')
export class RaportController {
  constructor(private readonly raportService: RaportService) {}

  @Post()
  create(@Body() createRaportDto: CreateRaportDto) {
    return this.raportService.create(createRaportDto);
  }

  @Get()
  findAll() {
    return this.raportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.raportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRaportDto: UpdateRaportDto) {
    return this.raportService.update(+id, updateRaportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.raportService.remove(+id);
  }
}
