import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthorizationService {
constructor(
    @Inject(forwardRef(() => UserService))
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
      const accessToken = await this.jwtService.signAsync(payload);
      return { accessToken, userId: user.id };
    }

    async singUp(createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.create(createUserDto);
    }

}
