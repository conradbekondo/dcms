import { Controller, Inject, UseFilters, UseGuards } from '@nestjs/common';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('users')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class UsersController extends BaseController {
    constructor (@Inject(injectionTokenKeys.appName) appName: string,
        usersService: UsersService) {
        super(appName, usersService);
    }
}
