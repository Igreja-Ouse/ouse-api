// src/modules/users/mappers/user.mapper.ts
import { Injectable } from '@nestjs/common';
import { UserFirebaseResponseDto } from 'src/modules/users/dtos/user-firebase-response.dto';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { UserDto } from 'src/modules/users/dtos/user.dto';

@Injectable()
export class UserMapper {
  /**
   * Mapeia um usuário do banco de dados e do Firebase para o DTO de resposta
   */
  toResponseDto(
    dbUser: {
      uid: string;
      celular: string;
      bairro: string;
    },
    firebaseUser?: {
      displayName?: string;
      email?: string;
      customClaims?: { roles?: string[] };
    },
  ): UserResponseDto {
    const response = new UserResponseDto();
    response.uid = dbUser.uid;
    response.celular = dbUser.celular;
    response.bairro = dbUser.bairro;
    response.usuarioFirebase = new UserFirebaseResponseDto();

    if (firebaseUser) {
      const nameParts = firebaseUser.displayName?.split(' ') || ['', ''];
      response.usuarioFirebase.firstName = nameParts[0];
      response.usuarioFirebase.lastName = nameParts.slice(1).join(' ');
      response.usuarioFirebase.email = firebaseUser.email || '';
      response.usuarioFirebase.roles = firebaseUser.customClaims?.roles || [];
    }

    return response;
  }

  /**
   * Mapeia um UserDto e um uid para o DTO de resposta
   */
  fromUserDtoToResponseDto(userDto: UserDto, uid: string): UserResponseDto {
    const response = new UserResponseDto();
    response.uid = uid;
    response.celular = userDto.celular;
    response.bairro = userDto.bairro;

    response.usuarioFirebase = new UserFirebaseResponseDto();

    if (userDto.usuarioFirebase) {
      response.usuarioFirebase.firstName = userDto.usuarioFirebase.firstName;
      response.usuarioFirebase.lastName = userDto.usuarioFirebase.lastName;
      response.usuarioFirebase.email = userDto.usuarioFirebase.email;
      response.usuarioFirebase.roles = userDto.usuarioFirebase.roles;
    }

    return response;
  }
}
