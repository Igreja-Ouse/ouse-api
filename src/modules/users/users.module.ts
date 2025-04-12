import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from 'src/common/mappers/user.mapper';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
    controllers: [UsersController],
    imports: [],
    providers: [UsersService, PrismaService, UserMapper, PaginationService],
})
export class UsersModule {}
