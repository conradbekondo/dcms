import { Controller, Get, Inject, Render, UseFilters, UseGuards } from '@nestjs/common';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { BaseController } from '../base/base.controller';

@Controller('clients')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class ClientsController extends BaseController {
    constructor(@Inject(injectionTokenKeys.appName) appName: string) {
        super(appName);
    }

  @Get()
  @Render('clients/view_clients')
  async clientsPage() {
    return { data: {}, view: this.viewBag };
  }
}
