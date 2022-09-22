import {
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { BaseController } from 'src/controllers/base/base.controller';
import { Role } from 'src/decorators/role.decorator';
import { Roles } from 'src/entities/roles';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { RoleCheckFailedFilter } from 'src/filters/role-check-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/auth/role.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { DataSource } from 'typeorm';

const BACKUP_FOLDER_PATH =
  'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\';

@Controller('backup')
@UseFilters(AuthFailedFilter, RoleCheckFailedFilter)
@Role(Roles.ADMIN, Roles.SYSTEM)
@UseGuards(AuthGuard, RoleGuard)
export class BackupController extends BaseController {
  private readonly logger = new Logger(BackupController.name);
  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    userService: UsersService,
    dataSource: DataSource,
  ) {
    super(appName, userService);
    /* if (!existsSync(BACKUP_FOLDER_PATH)) {
      mkdirSync(BACKUP_FOLDER_PATH);
    } */
  }

  @Post('')
  performBackup() { }

  @Get()
  @Render('settings/backup')
  backupRestore() {
    return { view: this.viewBag, data: {} };
  }
}
