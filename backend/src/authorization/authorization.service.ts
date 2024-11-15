import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthorizationService {
constructor(
    private usersService: UserService,
    private jwtService: JwtService,
) {}

    validateToken(token: string) {
        return this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET_KEY,
        });
    }

    async signIn(email: string, pass: string){
      const user = await this.usersService.findOne(email);
      if (!user) {
        throw new UnauthorizedException('User not found!');
      }
      const match = await bcrypt.compare(pass, user?.password);
      if (!match) {
        throw new UnauthorizedException('Invalid credentials!');
      }
      const payload = { sub: user.id, username: user.email };
      return await this.jwtService.signAsync(payload);
    }

    async singUp(createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.create(createUserDto);
    }

}
