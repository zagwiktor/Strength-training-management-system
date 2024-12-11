import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('get')
  findOne(@Req() request) {
    const userId = parseInt(request.cookies.userId, 10);
    if (!userId) {
      throw new UnauthorizedException('User ID not found in cookies');
    }
    return this.userService.findOne(userId);
  }

  @Patch('update')
  update(@Req() request, @Body() updateUserDto: UpdateUserDto) {
    const userId = parseInt(request.cookies.userId, 10);
    return this.userService.update(userId, updateUserDto);
  }

  @Delete('delete')
  remove(@Req() request) {
    const userId = parseInt(request.cookies.userId, 10);
    return this.userService.remove(userId);
  }
}
