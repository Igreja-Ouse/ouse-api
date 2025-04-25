import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateRolesDto } from './dtos/update-roles.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UserFilter } from './dtos/user-filter.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() userDto: CreateUserDto) {
    return await this.usersService.create(userDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.usersService.sendPasswordResetEmail(dto);
  }

  @Put('update-roles')
  @UseGuards(AuthGuard)
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
  async getAll(@Query() dto: UserFilter) {
    return this.usersService.getAll(dto);
  }
}
