import { Body, Controller, HttpCode, Post, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
import { IdToken } from 'src/common/utils/id-token.decorator';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.login(loginDto, response);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @IdToken() token: string,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.logout(token, response);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.refreshAuthToken(request, response);
  }
}
