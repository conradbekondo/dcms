import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { IPrincipal } from 'src/models/principal.model';
import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {
    }

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const { Authorization } = request.cookies;
        if (!Authorization || Authorization == '') throw new UnauthorizedException();
        try {
            const principal: IPrincipal = this.jwtService.verify(Authorization) as IPrincipal;
            this.usersService.principal = principal;
            return true;
        } catch (_) {
            return false;
        }
    }
}
