import { Body, Controller, Get, Inject, Post, Query, Render, Req, Res, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { ILoginDto } from 'src/dto/login.dto';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { LangService } from 'src/services/lang/lang.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('account')
export class AccountController extends BaseController {
    constructor(
        userService: UsersService,
        @Inject(injectionTokenKeys.appName) appName: string,
        @Inject(injectionTokenKeys.identityMaxAge)
        private readonly identityMaxAge: number,
        langService: LangService
    ) {
        super(appName, userService);
    }

    @Get()
    @UseGuards(AuthGuard)
    @UseFilters(AuthFailedFilter)
    account() {
        return {};
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
    @UsePipes(ValidationPipe)
    async handleLogin(
        @Body() loginDto: ILoginDto,
        @Query('returnUrl') returnUrl: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const errors: string[] = [];
        if (
            (!loginDto.username || loginDto.username.length == 0) &&
            (!loginDto.password || loginDto.password.length == 0)
        ) {
            errors.push('Username & password required');
            res.render('login/login', {
                data: { formData: loginDto, errors, returnUrl },
                view: this.viewBag
            });
            return;
        }

        const loginResult = await this.userService.loginUser(loginDto);
        if (loginResult.success) {
            res.cookie('Authorization', `${loginResult.jwtToken}`, {
                maxAge: this.identityMaxAge
            });
            res.redirect(returnUrl ? `${decodeURIComponent(returnUrl)}` : '/');
            return;
        }
        errors.push(loginResult.error);
        res.render('login/login', {
            data: { formData: loginDto, errors, returnUrl },
            view: this.viewBag
        });
    }
}
