import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class UserFilter extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por nome' })
  @IsOptional()
  @IsString()
  nome?: string;
  
  @ApiPropertyOptional({ description: 'Filtrar por email' })
  @IsOptional()
  @IsString()
  email?: string;
  
  @ApiPropertyOptional({ description: 'Filtrar por celular' })
  @IsOptional()
  @IsString()
  celular?: string;
  
  @ApiPropertyOptional({ description: 'Filtrar por bairro' })
  @IsOptional()
  @IsString()
  bairro?: string;
  
}