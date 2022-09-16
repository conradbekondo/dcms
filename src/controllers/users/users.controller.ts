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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IUsersDto } from 'src/dto/users.dto';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { DataSource } from 'typeorm';
import { BaseController } from '../base/base.controller';
import { UsersService } from 'src/services/users/users.service';

@Controller('users')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class UsersController extends BaseController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {
    super(appName, usersService);
  }

  @Get()
  @Render('users/view_users')
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
  async storeUsers(
    @Body() createUsersDto: IUsersDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const errors: string[] = [];

    if (!createUsersDto.first_name || createUsersDto.first_name.length <= 0) {
      errors.push('User name required');
      return res
        .status(400)
        .json({ message: 'Unable to create User.', errors: errors });
    }

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
    @Body() updateUsersDto: IUsersDto,
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
