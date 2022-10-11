import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Render,
  UseFilters,
  UseGuards
} from '@nestjs/common';
import { BaseController } from 'src/controllers/base/base.controller';
import { Role } from 'src/decorators/role.decorator';
import { Roles } from 'src/entities/roles';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { RoleCheckFailedFilter } from 'src/filters/role-check-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/auth/role.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { Configuration } from 'src/services/config/config.interface';
import { ConfigService } from 'src/services/config/config.service';
import { UsersService } from 'src/services/users/users.service';

@Controller('settings')
@UseFilters(AuthFailedFilter, RoleCheckFailedFilter)
@Role(Roles.ADMIN, Roles.SYSTEM)
@UseGuards(AuthGuard, RoleGuard)
export class SettingsController extends BaseController {
  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    userService: UsersService,
    private configService: ConfigService
  ) {
    super(appName, userService);
  }

  @Get()
  @Render('settings/configure-settings')
  async configureSettings() {
    this.viewBag.pageTitle = 'Configure Settings';
    return { view: this.viewBag, data: { ...this.configService.config } };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() config: Configuration) {
    this.configService.updateConfig(config);
  }

}
