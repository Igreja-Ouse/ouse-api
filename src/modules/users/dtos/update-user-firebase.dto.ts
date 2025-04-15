import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  IsArray,
} from 'class-validator';

export class UpdateUserFirebaseDto {
  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Sobrenome do usuário' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @Length(8, 20)
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Cargo do usuário',
    example: ['admin, pastor, membro'],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];
}
