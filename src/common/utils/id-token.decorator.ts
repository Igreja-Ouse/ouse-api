import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IdToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }
    
    const authorization =
      request.headers['authorization'] || request.headers['Authorization'];
    
    if (authorization && typeof authorization === 'string') {
      const [type, token] = authorization.split(' ');
      
      if (type === 'Bearer' && token) {
        return token;
      }
    }
    
    if (request.query && request.query.token) {
      return request.query.token;
    }
    
    return null;
  },
);
