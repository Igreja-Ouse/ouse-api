
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdToken } from 'src/common/utils/id-token.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { FirebaseService } from '../firebase/firebase.service';

@Controller()
export class UsersController {

    constructor(private readonly usersService: UsersService, private readonly firebaseService: FirebaseService) { }

    @Post('cadastrar')
    async createUser(@Body() userDto: UserDto) {
        return await this.usersService.createUser(userDto);
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async profile(@IdToken() token : string) {
        return this.firebaseService.verifyIdToken(token);
    }
}
