import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ILoginDto } from 'src/dto/login.dto';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    userService: UsersService,
    @Inject(injectionTokenKeys.appName) appName: string,
    @Inject(injectionTokenKeys.identityMaxAge)
    private readonly identityMaxAge: number,
  ) {
    super(appName, userService);
  }

  @Render('login/login')
  @Get()
  login(@Query('returnUrl') returnUrl: string) {
    const data = {
      returnUrl,
      errors: [],
      formData: {},
    };
    this.viewBag.pageTitle = 'Sign in to Your Account';
    return { data, view: this.viewBag };
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  @UseFilters(AuthFailedFilter)
  handleLogout(@Res() res: Response) {
    res.cookie('Authorization', null);
    res.redirect('/');
  }

  @Post()
  async handleLogin(
    @Body() loginDto: ILoginDto,
    @Query('returnUrl') returnUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const errors: string[] = [];
    if (
      (!loginDto.username || loginDto.username.length == 0) &&
      (!loginDto.password || loginDto.password.length == 0)
    ) {
      errors.push('Username & password required');
      res.render('login/login', {
        data: { formData: loginDto, errors, returnUrl },
        view: this.viewBag,
      });
      return;
    }

    const loginResult = await this.userService.loginUser(loginDto);
    if (loginResult.success) {
      res.cookie('Authorization', `${loginResult.jwtToken}`, {
        maxAge: this.identityMaxAge,
      });
      res.redirect(returnUrl ? `${decodeURIComponent(returnUrl)}` : '/');
      return;
    }
    errors.push(loginResult.error);
    res.render('login/login', {
      data: { formData: loginDto, errors, returnUrl },
      view: this.viewBag,
    });
  }
}
