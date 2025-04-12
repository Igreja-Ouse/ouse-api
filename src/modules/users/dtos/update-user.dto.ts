import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { UpdateUserFirebaseDto } from "./update-user-firebase.dto";

export class UpdateUserDto {

    @ApiProperty({ description: 'id do usuário a ser atualizado' })
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ description: 'Celular do usuário' })
    @IsOptional()
    @IsString()
    celular: string;

    @ApiProperty({ description: 'Bairro do usuário' })
    @IsOptional()
    @IsString()
    bairro: string;

    @ApiProperty({ description: 'Usuário que fez a ultima alteração do registro' })
    @IsOptional()
    @IsString()
    uid_atualizacao: string

    @ApiProperty({ description: 'Dados do usuário no Firebase' })
    @ValidateNested()
    @Type(() => UpdateUserFirebaseDto)
    @IsOptional()
    usuarioFirebase?: UpdateUserFirebaseDto;
    
}