import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, isEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class UserFirebaseDto {

    @ApiProperty({ description: 'Nome do usuário' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ description: 'Sobrenome do usuário' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ description: 'Email do usuário' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Senha do usuário' })
    @IsNotEmpty()
    @Length(8, 20)
    password: string;

    @ApiProperty({ description: 'Cargo do usuário', example: ['admin, pastor, membro'] })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    roles?: string[];

}