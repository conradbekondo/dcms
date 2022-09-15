import { Body, Controller, Get, Inject, Post, Query, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { ILoginDto } from 'src/dto/login.dto';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('users')
export class UsersController extends BaseController {
    constructor (private readonly userService: UsersService,
        @Inject(injectionTokenKeys.appName) appName: string) {
        super(appName);
    }

    @Render('login/login')
    @Get('login')
    login(@Query('returnUrl') returnUrl: string) {
        const data = {
            returnUrl,
            errors: [],
            formData: {}
        };
        this.viewBag.pageTitle = 'Sign in to Your Account';
        return { data, view: this.viewBag };
    }


    @Post('login')
    async handleLogin(@Body() loginDto: ILoginDto, @Query('returnUrl') returnUrl: string, @Res() res: Response) {
        const errors: string[] = [];
        if ((!loginDto.username || loginDto.username.length == 0) && (!loginDto.password || loginDto.password.length == 0)) {
            errors.push('Username & password required');
            res.render('login/login', { data: { formData: loginDto, errors, returnUrl }, view: this.viewBag });
            return;
        }

        const loginResult = await this.userService.loginUser(loginDto);
        if (loginResult.success) {
            return res.redirect(returnUrl ? returnUrl : '/');
        }
        errors.push(loginResult.error);
        res.render('login/login', {
            data: { formData: loginDto, errors, returnUrl }, view: this.viewBag
        });
    }
}