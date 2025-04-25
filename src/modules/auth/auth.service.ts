import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { LoginDto } from './dtos/login.dto';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { BaseResponse } from 'src/common/utils/base-response';

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
    private configService: ConfigService
  ) {}

  async login({ email, password }: LoginDto, response?: Response) {
    const { idToken, refreshToken, expiresIn } =
      await this.firebaseService.signInWithEmailAndPassword(email, password);
    
    if (response) {
      const secure = this.configService.get('NODE_ENV') === 'production';
      
      response.cookie('access_token', idToken, {
        httpOnly: true,
        secure: secure,
        sameSite: 'strict',
        maxAge: this.calculateMaxAge('1h'),
        path: '/',
      });
      
      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: secure,
        sameSite: 'strict',
        maxAge: this.calculateMaxAge('7d'),
        path: '/',
      });
    }
    
    return BaseResponse.success(
      'Login realizado com sucesso!', 
      { idToken, refreshToken, expiresIn });
  }

  async logout(token: string, response?: Response) {
    const resp = await this.firebaseService.verifyIdToken(token);
    if (response) {
      response.clearCookie('access_token', { path: '/' });
      response.clearCookie('refresh_token', { path: '/' });
    }
    
    return await this.firebaseService.revokeRefreshTokens(resp.uid);
  }

  async refreshAuthToken(req: Request, response?: Response) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      
      if (!refreshToken) {
        return BaseResponse.unauthorized('Sessão expirada. Faça login novamente.');
      }
      
      const result = await this.firebaseService.refreshAuthToken(refreshToken);
      
      if (response) {
        const secure = this.configService.get('NODE_ENV') === 'production';
        const { idToken, newRefreshToken, expiresIn } = result;
        
        response.cookie('access_token', idToken, {
          httpOnly: true,
          secure: secure,
          sameSite: 'strict',
          maxAge: this.calculateMaxAge(expiresIn),
          path: '/',
        });
        
        response.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: secure,
          sameSite: 'strict',
          maxAge: this.calculateMaxAge('30d'),
          path: '/', 
        });
      }
      
      return BaseResponse.success('Token atualizado com sucesso', {
        accessToken: result.idToken,
        expiresIn: result.expiresIn
      });
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      return BaseResponse.unauthorized('Falha ao atualizar sessão. Faça login novamente.');
    }
  }
  
  private calculateMaxAge(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn * 1000;
    }
    
    const timePattern = /^(\d+)([smhd])$/;
    const matches = expiresIn.match(timePattern);
    
    if (!matches) {
      console.warn(`Formato de tempo não reconhecido: ${expiresIn}. Usando padrão de 1 dia.`);
      return 24 * 60 * 60 * 1000; // 1 dia em milissegundos
    }
    
    const value = parseInt(matches[1], 10);
    const unit = matches[2];
    
    switch (unit) {
      case 's': // segundos
        return value * 1000;
      case 'm': // minutos
        return value * 60 * 1000;
      case 'h': // horas
        return value * 60 * 60 * 1000;
      case 'd': // dias
        return value * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000; // valor padrão: 1 dia
    }
  }
}
