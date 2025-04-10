import { Request } from './../../../node_modules/jwks-rsa/node_modules/@types/express-serve-static-core/index.d';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { FirebaseService } from '../firebase/firebase.service';


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly firebaseService: FirebaseService) {}

    async canActivate(context: ExecutionContext) {
        const Request = context.switchToHttp().getRequest<Request>();

        const authHeader = Request.headers['authorization'];

        if(!authHeader) return false;

        const [bearer, token] = authHeader.split(' ');
        if(bearer !== 'Bearer' || !token) return false;

        try {
            await this.firebaseService.verifyIdToken(token);
            return true;
        } catch (error) {
            return false;
        }
    }

}