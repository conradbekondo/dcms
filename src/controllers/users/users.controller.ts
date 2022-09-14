import { Controller, Render, Get, Query } from '@nestjs/common';

@Controller('users')
export class UsersController {

    @Render('login')
    @Get('login')
    login(@Query('returnUrl') returnUrl: string) {
        const data = {
            returnUrl,
            errors: []
        };
        return data;
    }
}
