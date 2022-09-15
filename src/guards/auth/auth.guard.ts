import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor (private readonly usersService: UsersService, private readonly jwtService: JwtService) {
    }

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();
        return of(request.cookies).pipe(
            switchMap(cookies => {
                const { identity: identityCookie } = cookies;
                if (!identityCookie || identityCookie == '') {
                    response.redirect(`/users/login?returnUrl=${encodeURIComponent(request.url)}`);
                    return of(false);
                }
            })
        )
    }
}
