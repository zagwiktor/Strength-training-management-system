import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthorizationService {
constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
) {}

    validateToken(token: string) {
        return this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET_KEY,
        });
    }

    async signIn(email: string, pass: string,): Promise<{access_token: string}> {
        const user = await this.usersService.findOne(email);
        if(user?.password !== pass){
            throw new UnauthorizedException();
        }

        const payload = { sub: user.id, username: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async singUp(createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.create(createUserDto);
      }
}
