import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'email do usuário a ser atualizado' })
  @IsString()
  @IsNotEmpty()
  email: string;
}
