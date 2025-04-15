import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRolesDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'Cargo do usuário', example: ['admin, membro'] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];
}
