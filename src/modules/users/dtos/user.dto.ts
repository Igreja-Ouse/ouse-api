import { ApiProperty } from "@nestjs/swagger";
import { UserFirebaseDto } from "./user-firebase.dto";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";


export class UserDto {

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