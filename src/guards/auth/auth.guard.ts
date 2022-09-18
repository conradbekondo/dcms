import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
        return of(request.cookies).pipe(
            switchMap(({ Authorization }) => {
                if (!Authorization || Authorization == '') {
                    throw new UnauthorizedException();
                }
                const principal: IPrincipal = this.jwtService.verify(Authorization) as IPrincipal;
                this.usersService.principal = principal;

                return of(true);
            })
        )
    }
}
