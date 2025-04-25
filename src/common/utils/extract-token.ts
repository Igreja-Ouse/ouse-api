import { Request } from 'express';

export function extractJwtFromRequest(request: Request): string | null {
  if (request.cookies && request.cookies.access_token) {
    return request.cookies.access_token;
  }
  
  const authHeader = request.headers.authorization;
  if (authHeader) {
    const [bearer, token] = authHeader.split(' ');
    if (bearer === 'Bearer' && token) {
      return token;
    }
  }
  
  return null;
}