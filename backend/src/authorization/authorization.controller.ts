import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { request } from 'http';
import { Response } from 'express';

@Controller('auth')
export class AuthorizationController {
  constructor(
    private readonly authorizationService: AuthorizationService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async siginIn(@Body() signInDto: Record<string, any>, @Res() response: Response) {
  
    const { accessToken, userId } = await this.authorizationService.signIn(signInDto.email, signInDto.password);
  
    response.cookie('jwt', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, 
    });
  
    response.cookie('userId', userId, {
      httpOnly: false, 
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, 
    });
  
    return response.send({ message: 'Logged in successfully' });
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(@Body() signUpDto: CreateUserDto) {
    return await this.authorizationService.singUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res() response: Response) {
    response.cookie('jwt', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 0,
    });
  
    response.cookie('userId', '', {
      httpOnly: false, 
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 0, 
    });
  
    return response.send({ message: 'Logged out successfully' });
  }
}
