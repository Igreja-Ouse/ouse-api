import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [UsersController],
    imports: [],
    providers: [UsersService, PrismaService],
})
export class UsersModule {}
