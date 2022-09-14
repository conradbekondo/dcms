import { Controller, Render, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {

    @Render('users')
    @Get()
    public usersPage() {
        return { message: 'World' };
    }
}
