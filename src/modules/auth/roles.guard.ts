import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Request } from 'express';
import { extractJwtFromRequest } from 'src/common/utils/extract-token';
import { BaseResponse } from 'src/common/utils/base-response';

export function RolesGuard(...allowedRoles: string[]): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor(private readonly firebaseService: FirebaseService) {}

    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse();
      
      const token = extractJwtFromRequest(request);
      
      if (!token) {
        response.status(401).json(
          BaseResponse.unauthorized('Autenticação necessária')
        );
        return false;
      }

      try {
        const decodedToken = await this.firebaseService.verifyIdToken(token);
        
        request['user'] = decodedToken;
        
        const userRoles = decodedToken.roles || [];
        
        let rolesArray = userRoles;
        if (typeof userRoles === 'string') {
          try {
            rolesArray = JSON.parse(userRoles);
          } catch {
            rolesArray = [userRoles]; 
          }
        } else if (!Array.isArray(userRoles)) {
          rolesArray = [userRoles];
        }
        
        const hasPermission = allowedRoles.some(role => 
          Array.isArray(rolesArray) ? rolesArray.includes(role) : rolesArray === role
        );
        
        if (!hasPermission) {
          response.status(403).json(
            BaseResponse.forbidden('Permissão negada')
          );
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Erro ao verificar token ou permissões:', error);
        response.status(401).json(
          BaseResponse.unauthorized('Token inválido')
        );
        return false;
      }
    }
  }

  return mixin(RoleGuardMixin);
}
