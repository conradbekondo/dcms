import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Role } from 'src/decorators/role.decorator';
import { INewUserDto } from 'src/dto/new-user.dto';
import { Roles } from 'src/entities/roles';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';
import { validate } from 'class-validator';
import { CreateUserFailedFilter } from 'src/filters/create-user-failed.filter';
import { firstValueFrom, from, lastValueFrom, map, of, reduce, switchMap } from 'rxjs';

@Controller('users')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
@Role(Roles.ADMIN, Roles.SYSTEM)
export class UsersController extends BaseController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    usersService: UsersService,
  ) {
    super(appName, usersService);
  }

  @Get()
  async viewUsers(@Query('startAt') startAt: string, @Query('size') size: string, @Res() res: Response) {
    if (!startAt || startAt == '' || !/^-?\d+$/gm.test(startAt) || parseInt(startAt) < 0) {
      startAt = '0';
    }

    if (!size || size == '' || !/^-?\d+$/gm.test(size) || parseInt(size) <= 0) {
      size = '50';
    }

    return firstValueFrom(from(this.userService.getUsers(parseInt(startAt), parseInt(size))).pipe(
      switchMap(_users => {
        return of(..._users).pipe(
          map(({ profile, dateCreated, lastUpdated, roles, creator }) => {
            return {
              profile,
              roles: roles.map(r => r.roleName),
              dateCreated,
              lastUpdated,
              addedBy: !creator ? 'N/A' : `${creator.profile.firstName} ${creator.profile.lastName || ''}`.trim()
            }
          }),
          reduce((acc: any[], curr) => [...acc, curr], [])
        )
      })
    )).then(users => {
      this.viewBag.pageTitle = 'System Users';
      const v = { data: { users: users, errors: [], newUser: new INewUserDto() }, view: this.viewBag };
      res.render('users/users', v);
    });
  }

  @Get(':id')
  async getUsers(@Param('id') id: number, @Res() res: Response) {
    const users = await this.userService.getUser(id);
    return res.json(users);
  }

  @Post()
  @UsePipes(new ValidationPipe({
    transform: true
  }))
  @UseFilters(CreateUserFailedFilter)
  async storeUser(
    @Body() createUsersDto: INewUserDto,
    @Res() res: Response,
  ) {

    try {
      const stored = await this.userService.createUser(createUsersDto);

      if (stored.success)
        return res.status(201).json({ message: 'User created successfully.' });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  @Put(':id')
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
  }

  @Delete(':id')
  async deleteUsers(
    @Param('id') id: number,
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
    return `${(user == null)}`;
  }
}
