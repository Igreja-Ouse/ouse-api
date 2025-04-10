import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class LoginDto {
    
    @ApiProperty({description: 'Email do usuário'})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({description: 'Senha do usuário'})
    @IsNotEmpty()
    @Length(8, 20)
    password: string;
}