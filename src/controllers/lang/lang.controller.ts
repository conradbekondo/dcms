import { Controller, Get, Inject } from '@nestjs/common';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('lang')
export class LangController extends BaseController {
    constructor (@Inject(injectionTokenKeys.appName) appName,
        userService: UsersService) {
        super(appName, userService);
    }

    @Get(['', '/en'])
    async setEnglishLang() {
        
    }

    @Get('/fr')
    async setFrenchLang() {

    }
}
