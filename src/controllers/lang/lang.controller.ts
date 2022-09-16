import { Controller, Get, Inject, Query, Res, Req} from '@nestjs/common';
import { Response, Request } from 'express';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('lang')
export class LangController extends BaseController {
    private lang = 'en';
    constructor (@Inject(injectionTokenKeys.appName) appName,
        userService: UsersService) {
        super(appName, userService);
    }

    @Get(['', '/en'])
    async setEnglishLang() {
        this.lang = 'en';
    }

    @Get('/fr')
    async setFrenchLang(@Query('dest') dest: string, @Req req: REquest @Res() res: Response) {
        this.lang = 'fr';
        res.redirect();
    }
}
