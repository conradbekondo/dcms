import { Controller, Get, Inject, Logger, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import injectionTokenKeys from 'src/injection-tokens';
import { LangService } from 'src/services/lang/lang.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('lang')
export class LangController extends BaseController {
    private readonly logger = new Logger(LangController.name);
    constructor (@Inject(injectionTokenKeys.appName) appName: string,
        userService: UsersService, private readonly langService: LangService) {
        super(appName, userService);
        langService.lang$.subscribe(lang => {
            this.logger.debug(`Language switched to ${lang}`);
        })
    }

    @Get(['', '/en'])
    async setEnglishLang(@Query('dest') dest: string, @Res() res: Response) {
        this.langService.lang = 'en';
        res.redirect(dest ? dest : '/');
    }

    @Get('/fr')
    async setFrenchLang(@Query('dest') dest: string, @Res() res: Response) {
        this.langService.lang = 'fr';
        res.redirect(dest ? dest : '/');
    }
}
