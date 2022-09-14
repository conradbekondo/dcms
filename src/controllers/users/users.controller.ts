import { Body, Controller, Get, Post, Query, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { ILoginDto } from 'src/dto/login.dto';

@Controller('users')
export class UsersController {

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
    handleLogin(@Body() loginDto: ILoginDto, @Query('returnUrl') returnUrl: string, @Res() res: Response) {
        const errors: string[] = [];
        if ((!loginDto.username || loginDto.username.length == 0) && (!loginDto.password || loginDto.password.length == 0)) {
            res.render('login', { data: { formData: loginDto, errors, returnUrl } });
            errors.push('Username & password required');
            return;
        }
    }
}
