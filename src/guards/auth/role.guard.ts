import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, Observable } from 'rxjs';
import { ROLE_KEY } from 'src/decorators/role.decorator';
import { Roles } from 'src/entities/roles';
import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return new Promise<boolean>(async (resolve, reject) => {
      const principal = this.userService.getPrincipal();
      if (!principal) {
        return reject(new UnauthorizedException());
      } else {
        const userIsInRoles = await this.userService.isUserInRoles(
          requiredRoles,
          principal.username,
        );
        if (userIsInRoles) {
          return resolve(true);
        } else {
          return reject(new ForbiddenException());
        }
      }
    });
  }
}
