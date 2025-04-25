import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Request } from 'express';
import { extractJwtFromRequest } from 'src/common/utils/extract-token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    
    const token = extractJwtFromRequest(request);
    
    if (!token) return false;

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      request['user'] = decodedToken; 
      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  }
}
