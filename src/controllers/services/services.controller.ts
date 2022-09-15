import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { BaseController } from '../base/base.controller';

@Controller('services')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class ServicesController extends BaseController {

}
