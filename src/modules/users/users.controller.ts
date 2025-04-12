import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { FirebaseService } from '../firebase/firebase.service';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateRolesDto } from './dtos/update-roles.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('Users')
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() userDto: CreateUserDto) {
        return await this.usersService.create(userDto);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return await this.usersService.sendPasswordResetEmail(dto);
    }

    @Put('update-roles')
    @UseGuards(AuthGuard, RolesGuard('admin'))
    @ApiBearerAuth()
    async register(@Body() userDto: UpdateRolesDto) {
        return await this.usersService.updateRoles(userDto);
    }

    @Patch()
    @UseGuards(AuthGuard, RolesGuard('admin'))
    @ApiBearerAuth()
    async updateUser(@Body() userDto: UpdateUserDto) {
        return await this.usersService.update(userDto);
    }

    @Get(':id')
    @UseGuards(AuthGuard, RolesGuard('admin'))
    @ApiBearerAuth()
    async getUsuarioById(@Param('id') id: number) {
        return this.usersService.getById(id);
    }

    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página atual (começa em 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Itens por página' })
    @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Campo para ordenação' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Direção da ordenação' })
    @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filtro de texto para busca' })
    async getAll() {
        return this.usersService.getAll();
    }
}
