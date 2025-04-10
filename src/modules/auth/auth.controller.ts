import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdToken } from 'src/common/utils/id-token.decorator';
import { AuthGuard } from './auth.guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(200)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('logout')
    @HttpCode(204)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async logout(@IdToken() token : string) {
        return this.authService.logout(token);
    }

    @Post('refresh-token')
    @HttpCode(200)
    async refreshToken(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshAuthToken(dto.refreshToken);
    }
}
