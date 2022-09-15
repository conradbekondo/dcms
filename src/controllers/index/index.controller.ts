import { Controller, Get, Inject, Render } from '@nestjs/common';
import injectionTokenKeys from 'src/injection-tokens';
import { BaseController } from '../base/base.controller';

@Controller()
export class IndexController extends BaseController {
    constructor (@Inject(injectionTokenKeys.appName) appName: string) {
        super(appName);
    }

    @Get()
    @Render('index/index')
    index() {
        this.viewBag.pageTitle = null;
        return { data: {}, view: this.viewBag };
    }
}
