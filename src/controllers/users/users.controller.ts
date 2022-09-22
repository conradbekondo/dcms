import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import {
  catchError,
  firstValueFrom,
  from,
  map,
  of,
  reduce,
  switchMap,
} from 'rxjs';
import { Role } from 'src/decorators/role.decorator';
import { INewUserDto } from 'src/dto/new-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { Roles } from 'src/entities/roles';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { CreateUserFailedFilter } from 'src/filters/create-user-failed.filter';
import { RoleCheckFailedFilter } from 'src/filters/role-check-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/auth/role.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('users')
@UseFilters(AuthFailedFilter, RoleCheckFailedFilter)
@Role(Roles.ADMIN, Roles.SYSTEM)
@UseGuards(AuthGuard, RoleGuard)
export class UsersController extends BaseController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    usersService: UsersService,
  ) {
    super(appName, usersService);
  }

  @Get()
  async viewUsers(
    @Query('startAt') startAt: string,
    @Query('size') size: string,
    @Res() res: Response,
  ) {
    if (
      !startAt ||
      startAt == '' ||
      !/^-?\d+$/gm.test(startAt) ||
      parseInt(startAt) < 0
    ) {
      startAt = '0';
    }

    if (!size || size == '' || !/^-?\d+$/gm.test(size) || parseInt(size) <= 0) {
      size = '50';
    }

    return firstValueFrom(
      from(this.userService.getUsers(parseInt(startAt), parseInt(size))).pipe(
        switchMap((_users) => {
          return of(..._users).pipe(
            map(({ id, profile, dateCreated, lastUpdated, roles, creator }) => {
              return {
                id,
                profile,
                roles: roles.map((r) => r.roleName),
                dateCreated,
                lastUpdated,
                addedBy: !creator
                  ? 'N/A'
                  : `${creator.profile.firstName} ${
                      creator.profile.lastName || ''
                    }`.trim(),
              };
            }),
            reduce((acc: any[], curr) => [...acc, curr], []),
          );
        }),
      ),
    ).then((users) => {
      this.viewBag.pageTitle = 'System Users';
      const v = {
        data: { users: users, errors: [], newUser: new INewUserDto() },
        view: this.viewBag,
      };
      res.render('users/users', v);
    });
  }

  @UsePipes(ValidationPipe)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Res() res: Response,
  ) {
    return firstValueFrom(
      from(this.userService.getUser(parseInt(id))).pipe(
        switchMap((user) => {
          if (user) {
            return from(this.userService.updateUser(body, parseInt(id)));
          }
        }),
        catchError((error, user) => {
          if (user) {
            return user;
          }
          {
            this.logger.error(error.message);
            return of({ success: false, user: null });
          }
        }),
      ),
    ).then((x) => {
      if (x.success) {
        res.status(HttpStatus.ACCEPTED).send({ message: 'OK' });
      } else {
        res.status(HttpStatus.NOT_FOUND).send({ message: 'User not found' });
      }
    });
  }

  @Get('/update/:id')
  async getUsers(@Param('id') id: string, @Res() res: Response) {
    return firstValueFrom(
      from(this.userService.getUser(parseInt(id))).pipe(
        switchMap((_user) => {
          if (_user) {
            const dto = new UpdateUserDto();
            dto.address = _user.profile.address;
            dto.firstName = _user.profile.firstName;
            dto.lastName = _user.profile.lastName;
            dto.natId = _user.profile.natId;
            dto.gender = _user.profile.gender.toString();
            dto.id = _user.id.toString();
            dto.phone = _user.profile.phoneNumber;
            dto.role = _user.roles[0].roleName as 'admin' | 'staff';
            return of(dto);
          } else {
            return of(null);
          }
        }),
        catchError(() => of(null)),
      ),
    ).then((dto) => {
      if (!dto) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'User not found with ID: ' + id });
      } else {
        res.status(HttpStatus.OK).json({ dto });
      }
    });
  }

  @Post()
  @UsePipes(ValidationPipe)
  @UseFilters(CreateUserFailedFilter)
  async storeUser(@Body() createUsersDto: INewUserDto, @Res() res: Response) {
    try {
      const stored = await this.userService.createUser(createUsersDto);

      if (stored.success)
        return res.status(201).json({ message: 'User created successfully.' });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  /* @Put(':id')
  async updateUsers(
    @Body() updateUsersDto: INewUserDto,
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const updated = await this.userService.updateUser(updateUsersDto, id);

    if (updated.success)
      return res.json({ message: 'User updated successfully.' });
    else return res.status(500).json({ message: 'Unable to update user.' });
  } */

  @Delete(':id')
  async deleteUsers(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const deleted = await this.userService.deleteUser(id);

    if (deleted.success)
      return res.json({ message: 'User deleted successfully.' });
    else return res.status(500).json({ message: 'Unable to delete user.' });
  }

  @Post('isUsernameUnique')
  async isUsernameUnique(@Body() { username }: { username: string }) {
    const user = await this.userService.getUser(username);
    return `${user == null}`;
  }
}
