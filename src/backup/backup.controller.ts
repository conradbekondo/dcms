import { Body, Controller, Get, Inject, Logger, Post, Render, Res, UseFilters, UseGuards } from '@nestjs/common';
import { BaseController } from 'src/controllers/base/base.controller';
import { INewServiceDto } from 'src/dto/new-service.dto';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';

@Controller('backup')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class BackupController extends BaseController {
    private readonly logger = new Logger(BackupController.name);
    constructor (@Inject(injectionTokenKeys.appName) appName: string,
        userService: UsersService) {
        super(appName, userService);
    }

    @Get()
    @Render('settings/backup')
    backupRestore(){
        return {view: this.viewBag, data:{}}
    }   

}





    
    