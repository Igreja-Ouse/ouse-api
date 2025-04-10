import { User } from './../../../generated/prisma/index.d';
import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { UserDto } from "./dtos/user.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly prismaService: PrismaService
    ) {}

    async createUser(userDto: UserDto) {
        const { celular, bairro  } = userDto;
        const { email, password, firstName, lastName,  } = userDto.userFirebase;

        const user = await this.firebaseService.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });

        if(user){
            await this.prismaService.user.create({
                data: {
                    celular,
                    bairro,
                    nome: `${firstName} ${lastName}`,
                    email: email,
                    uid: user.uid,
                },
            });
        }
            

        if(userDto.userFirebase.roles?.length){
            await this.firebaseService.setCustomUserClaims(user.uid, { roles: userDto.userFirebase.roles });
        }

        return {
            celular: userDto.celular,
            bairro: userDto.bairro,
            userFirebase: {
                firstName,
                lastName,
                email,
                password,
                roles: userDto.userFirebase.roles,
            },
            uid: user.uid
        }
    }
}