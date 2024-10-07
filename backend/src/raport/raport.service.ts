import { Injectable } from '@nestjs/common';
import { CreateRaportDto } from './dto/create-raport.dto';
import { UpdateRaportDto } from './dto/update-raport.dto';

@Injectable()
export class RaportService {
  create(createRaportDto: CreateRaportDto) {
    return 'This action adds a new raport';
  }

  findAll() {
    return `This action returns all raport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} raport`;
  }

  update(id: number, updateRaportDto: UpdateRaportDto) {
    return `This action updates a #${id} raport`;
  }

  remove(id: number) {
    return `This action removes a #${id} raport`;
  }
}
