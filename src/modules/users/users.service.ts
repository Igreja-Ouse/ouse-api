import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { PrismaService } from "../prisma/prisma.service";
import { UserResponseDto } from './dtos/user-response.dto';
import { UserMapper } from "src/common/mappers/user.mapper";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UpdateRolesDto } from './dtos/update-roles.dto';
import { BaseResponse } from 'src/common/utils/base-response';
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { PagedList } from 'src/common/pagination/paged-list';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Injectable()
export class UsersService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly prismaService: PrismaService,
        private readonly userMapper: UserMapper,
        private readonly paginationService: PaginationService
    ) {}

    async getAll(params: PaginationDto = {}): Promise<BaseResponse<PagedList<UserResponseDto>>> {
        // Construir filtro se necessário
        let where = {};
        if (params.filter) {
          where = {
            OR: [
              { nome: { contains: params.filter, mode: 'insensitive' } },
              { email: { contains: params.filter, mode: 'insensitive' } },
              { celular: { contains: params.filter, mode: 'insensitive' } },
              { bairro: { contains: params.filter, mode: 'insensitive' } }
            ]
          };
        }
        
        // Usar o serviço de paginação
        const pagedList = await this.paginationService.paginate<any>(
          this.prismaService.usuario,
          params,
          where
        );
        
        // Mapear usuários para incluir dados do Firebase
        const mappedPagedList = await pagedList.mapAsync(async (user) => {
          const firebaseUser = await this.firebaseService.getUserByUid(user.uid);
          return this.userMapper.toResponseDto(user, firebaseUser);
        });
        
        return BaseResponse.success('', mappedPagedList);
      }

    async getById(id: number): Promise<BaseResponse<UserResponseDto>> {
        const user = await this.prismaService.usuario.findFirst({ where: { id } });
        
        if(!user) 
            return BaseResponse.notFound('Usuário não encontrado!');

        const firebaseUser = await this.firebaseService.getUserByUid(user.uid);
        
        return BaseResponse.success('', this.userMapper.toResponseDto(user, firebaseUser));
    } 

    async create(userDto: CreateUserDto): Promise<BaseResponse<UserResponseDto>> {

        const { celular, bairro } = userDto;
        const { email, password, firstName, lastName } = userDto.userFirebase;
        const displayName = `${firstName} ${lastName}`;

        const firebaseUser = await this.firebaseService.createUser({
            email,
            password,
            displayName,
        });

        if (!firebaseUser) 
            throw new Error('Erro ao criar usuário!');

        const resp = await this.prismaService.usuario.create({
            data: {
                celular,
                bairro,
                nome: displayName,
                email,
                uid: firebaseUser.uid,
                uid_cadastro: firebaseUser.uid,
            },
        });

        return BaseResponse.success('Usuário criado com sucesso!', this.userMapper.toResponseDto(resp, firebaseUser));
    }

    async updateRoles(dto: UpdateRolesDto) : Promise<BaseResponse<UserResponseDto>> {

        const usuario = await this.prismaService.usuario.findFirst({
            where: { id: dto.id } 
        })

        if(!usuario)
            throw new NotFoundException('Usuário não encontrado!');

        if(!usuario.uid)
            throw new BadRequestException('Usuário não possui UID!');

        if(!dto.roles || dto.roles.length === 0)
            throw new BadRequestException('Nenhum papel fornecido!');

        const firebaseUser = await this.firebaseService.getUserByUid(usuario.uid);
        
        const currentRoles = firebaseUser.customClaims?.roles || [];
        
        const sortedCurrentRoles = [...currentRoles].sort();
        const sortedNewRoles = [...dto.roles].sort();
        
        const currentRolesStr = JSON.stringify(sortedCurrentRoles);
        const newRolesStr = JSON.stringify(sortedNewRoles);
        
        if (currentRolesStr === newRolesStr) {
            return BaseResponse.success('Nenhuma alteração de papel necessária!', this.userMapper.toResponseDto(usuario, firebaseUser));
        }

        await this.firebaseService.setCustomUserClaims(usuario.uid, { roles: dto.roles });
        
        const updatedFirebaseUser = await this.firebaseService.getUserByUid(usuario.uid);

        return BaseResponse.success('Papel atualizado com sucesso!', this.userMapper.toResponseDto(usuario, updatedFirebaseUser));

    }

    async update(userDto: UpdateUserDto): Promise<BaseResponse<UserResponseDto>> {
        // Validações iniciais
        if (!userDto.id) {
            return BaseResponse.error('ID do usuário não fornecido!');
        }
            
        const existingUser = await this.prismaService.usuario.findFirst({ 
            where: { id: userDto.id }  
        });
        
        if (!existingUser) {
            return BaseResponse.notFound('Usuário não encontrado!');
        }

        // Extrair apenas os campos do banco de dados (excluindo userFirebase)
        const { usuarioFirebase, id, ...updateData } = userDto;
        
        // Preparar objetos para Firebase se necessário
        let firebaseUpdateData = {};
        
        if (usuarioFirebase) {
            // Tratar nome para atualização no banco e Firebase
            if (usuarioFirebase.firstName || usuarioFirebase.lastName) {
                const newFirstName = usuarioFirebase.firstName || existingUser.nome.split(' ')[0];
                const newLastName = usuarioFirebase.lastName || existingUser.nome.split(' ').slice(1).join(' ');
                const displayName = `${newFirstName} ${newLastName}`;
                
                // Adicionar ao updateData do Firebase
                firebaseUpdateData = {
                    ...firebaseUpdateData,
                    displayName
                };
            }
            
            // Adicionar email para atualização no Firebase também
            if (usuarioFirebase.email) {
                firebaseUpdateData = {
                    ...firebaseUpdateData,
                    email: usuarioFirebase.email
                };
            }
            
            // Adicionar senha para atualização no Firebase
            if (usuarioFirebase.password) {
                firebaseUpdateData = {
                    ...firebaseUpdateData,
                    password: usuarioFirebase.password
                };
            }
        }
        
        // Adicionar data de atualização
        updateData.uid_atualizacao = existingUser.uid;
        
        // Executar atualizações em paralelo
        const [updatedUser] = await Promise.all([
            // Atualizar no banco de dados usando o que tiver sido fornecido
            this.prismaService.usuario.update({
                where: { id: existingUser.id },
                data: updateData
            }),
            
            // Atualizar no Firebase se houver dados para atualizar
            ...(Object.keys(firebaseUpdateData).length > 0 
                ? [this.firebaseService.updateUser(existingUser.uid, firebaseUpdateData)]
                : []),
                
            // Atualizar roles se fornecidas
            ...(usuarioFirebase?.roles 
                ? [this.firebaseService.setCustomUserClaims(existingUser.uid, { roles: usuarioFirebase.roles })]
                : [])
        ]);
        
        // Buscar dados atualizados do Firebase
        const firebaseUser = await this.firebaseService.getUserByUid(existingUser.uid);
        
        // Retornar dados formatados
        return BaseResponse.success('Usuário atualizado com sucesso!', this.userMapper.toResponseDto(updatedUser, firebaseUser));
    }
    
    async sendPasswordResetEmail(dto: ResetPasswordDto): Promise<BaseResponse<string>> {
        try {
      
          await this.firebaseService.sendPasswordResetEmail(dto.email);
      
          return BaseResponse.success(
            'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
          );

        } catch (error) {
          console.error('Erro ao enviar email de recuperação:', error);
          return BaseResponse.error('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
        }
    }

    private mapToResponseDto(userDto: CreateUserDto, uid: string): UserResponseDto {
        const { celular, bairro, userFirebase } = userDto;
        const { firstName, lastName, email } = userFirebase;

        return {
            celular,
            bairro,
            uid,
            usuarioFirebase: {
                firstName,
                lastName,
                email,
            },
        };
    }
}