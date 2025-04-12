import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { CanActivate, ExecutionContext, Injectable, mixin, Type } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";


export function RolesGuard(...allowedRoles: string[]): Type<CanActivate> {

    @Injectable()
    class RoleGuardMixin implements CanActivate {
        constructor(private readonly firebaseService: FirebaseService) {}

        async canActivate(context: ExecutionContext) {
            const Request = context.switchToHttp().getRequest<Request>();
    
            const authHeader = Request.headers['authorization'];
   
            if(!authHeader) return false;
    
            const [bearer, token] = authHeader.split(' ');
            if(bearer !== 'Bearer' || !token) return false;
    
            try {
                const decodedToken =  await this.firebaseService.verifyIdToken(token);
                const userRoles = decodedToken.roles ?? [];
                return allowedRoles.some((required) => userRoles.includes(required));
            } catch (error) {
                return false;
            }
        }
    }

    return mixin(RoleGuardMixin);
}