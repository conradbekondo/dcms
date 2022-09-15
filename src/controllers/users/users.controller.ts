import { Body, Controller, Get, Logger, Post, Query, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { of, timeout } from 'rxjs';
import { ILoginDto } from 'src/dto/login.dto';
import { UsersService } from 'src/services/users/users.service';

@Controller('users')
export class UsersController {

    private readonly logger = new Logger(UsersController.name);

    constructor (private readonly userService: UsersService) {
    }

    @Render('login')
    @Get('login')
    login(@Query('returnUrl') returnUrl: string) {
        const data = {
            returnUrl,
            errors: [],
            formData: {}
        };
        return { data };
    }


    @Post('login')
    async handleLogin(@Body() loginDto: ILoginDto, @Query('returnUrl') returnUrl: string, @Res() res: Response) {
        const errors: string[] = [];
        if ((!loginDto.username || loginDto.username.length == 0) && (!loginDto.password || loginDto.password.length == 0)) {
            errors.push('Username & password required');
            res.render('login', { data: { formData: loginDto, errors, returnUrl } });
            return;
        }

        const loginResult = await this.userService.loginUser(loginDto);
        if (loginResult.success) {
            return res.redirect(returnUrl ? returnUrl : '/');
        }
        errors.push(loginResult.error);
        res.render('login', { data: { formData: loginDto, errors, returnUrl } });
    }
}
