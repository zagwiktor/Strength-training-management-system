import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthorizationController {
  constructor(
    private readonly authorizationService: AuthorizationService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  siginIn(@Body() signInDto: Record<string, any>) {
    return this.authorizationService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  signUp(@Body() signUpDto: CreateUserDto) {
    return this.authorizationService.singUp(signUpDto);
  }

}
