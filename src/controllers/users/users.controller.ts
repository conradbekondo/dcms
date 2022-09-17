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
  @Render('users/users')
  async viewUsers() {
    const users = await this.userService.getUsers();
    return { data: { users: users }, view: this.viewBag };
  }

  @Get(':id')
  async getUsers(@Param('id') id: number, @Res() res: Response) {
    const users = await this.userService.getUser(id);
    return res.json(users);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async storeUsers(
    @Body() createUsersDto: INewUserDto,
    @Res() res: Response,
  ) {
    // const errors: string[] = [];

    /* if (!createUsersDto.firstName || createUsersDto.firstName.length <= 0) {
      errors.push('User name required');
      return res
        .status(400)
        .json({ message: 'Unable to create User.', errors: errors });
    } */

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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deleted = await this.userService.deleteUser(id);

    if (deleted.success)
      return res.json({ message: 'User deleted successfully.' });
    else return res.status(500).json({ message: 'Unable to delete user.' });
  }
}
