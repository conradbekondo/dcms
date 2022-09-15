import { Body, Controller, Get, Inject, Logger, Post, Query, Render, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { INewServiceDto } from 'src/dto/new-service.dto';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { OfferedServicesService } from 'src/services/offered-services/offered-services.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('services')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class ServicesController extends BaseController {
    private readonly logger = new Logger(ServicesController.name);
    constructor (@Inject(injectionTokenKeys.appName) appName: string,
        private readonly offeredServicesService: OfferedServicesService,
        userService: UsersService) {
        super(appName, userService);
    }

    @Get(['', '/create'])
    @Render('additional_services/additional_services')
    async createService(@Query('start') start?: number, @Query('size') size?: number) {
        this.viewBag.pageTitle = 'Create a Service';
        const services = await this.offeredServicesService.getServices(start, size);
        return { view: this.viewBag, data: { services, formData: {} } };
    }

    @Post(['', '/create'])
    async handlePost(@Body() formBody: INewServiceDto, @Res() res: Response) {
        const ans = { view: this.viewBag, data: { formData: formBody, errors: [] } };

        if (!formBody.name) ans.data.errors.push('Service name is required');
        if (formBody.standardPrice === undefined || formBody.standardPrice === null) ans.data.errors.push('Standard price required')

        if (ans.data.errors.length <= 0) {
            const serviceExists = await this.offeredServicesService.serviceExistsWithName(formBody.name);
            if (serviceExists) {
                ans.data.errors.push(`Service already exists: '${formBody.name}'`);
            } else {
                await this.offeredServicesService.createService(formBody);
            }
        }

        if (ans.data.errors.length > 0) {
            res.render('additional_services/additional_services', ans);
            return;
        }

        res.redirect('/services');
    }
}
