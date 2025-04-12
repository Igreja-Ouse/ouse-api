import { UserFirebaseResponseDto } from "./user-firebase-response.dto";

export class UserDto{
    
    id: string;
    name: string;
    email: string;
    password: string;
    celular: string;
    bairro: string;
    uid: string;
    dt_cadastro: Date;
    dt_atualizacao: Date;
    uid_cadastro?: Date;
    uid_atualizacao: boolean;

    usuarioFirebase?: UserFirebaseResponseDto;

    constructor(partial: Partial<UserDto>) {
        Object.assign(this, partial);
    }
}