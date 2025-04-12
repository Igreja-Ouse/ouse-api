import { ApiProperty } from "@nestjs/swagger";
import { UserFirebaseDto } from "./user-firebase.dto";
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";


export class CreateUserDto {

    @ApiProperty({ description: 'uid do usuário a ser atualizado' })
    @IsString()
    @IsOptional()
    uid: string;

    @ApiProperty({ description: 'id do usuário a ser atualizado' })
    @IsNumber()
    @IsOptional()
    id: number;

    @ApiProperty({ description: 'Celular do usuário' })
    @IsString()
    @IsNotEmpty()
    celular: string;

    @ApiProperty({ description: 'Bairro do usuário' })
    @IsString()
    @IsNotEmpty()
    bairro: string;

    @ApiProperty({ description: 'Celular do usuário' })
    @ValidateNested()
    @Type(() => UserFirebaseDto)
    userFirebase: UserFirebaseDto;

}