import { Body, Controller, Get, Inject, Logger, Post, Query, Render, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { from, lastValueFrom, map, of, reduce, switchMap, zipAll } from 'rxjs';
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
    constructor(@Inject(injectionTokenKeys.appName) appName: string,
        private readonly offeredServicesService: OfferedServicesService,
        userService: UsersService) {
        super(appName, userService);
    }

    @Get()
    @Render('additional_services/additional_services')
    async createService(@Query('start') start: string = '0', @Query('size') size: string = '') {
        let _start: number, _size: number;
        if (isNaN(parseInt(start)))
            _start = 0;
        else _start = parseInt(start);
        if (isNaN(parseInt(size)))
            _size = 50;
        else _size = parseInt(size);
        this.viewBag.pageTitle = 'Create a Service';
        const services = await lastValueFrom(from(this.offeredServicesService.getServices(_start, _size)).pipe(
            switchMap(_services => {
                return of(..._services).pipe(
                    map(({ dateCreated, lastUpdated, name, isAdditional, id, creator: { profile: { firstName, lastName } } }) => {
                        const __service = {
                            dateCreated,
                            lastUpdated,
                            isAdditional,
                            id,
                            name,
                            creator: {
                                profile: { firstName, lastName }
                            }
                        };

                        return __service;
                    }),
                    reduce((acc: any[], curr: any) => {
                        acc.push(curr);
                        return acc;
                    }, [])
                )
            })
        ))
        return { view: this.viewBag, data: { startAt: _start, size: _size, services, formData: {} } };
    }

    @Post()
    async handlePost(@Body() formBody: INewServiceDto, @Res() res: Response, @Query('start') start = '0', @Query('size') size = '50') {
        let _start: number, _size: number;
        if (isNaN(parseInt(start)))
            _start = 0;
        else _start = parseInt(start);
        if (isNaN(parseInt(size)))
            _size = 50;
        else _size = parseInt(size);
        const ans = { view: this.viewBag, data: { startAt: _start, size: _size, formData: formBody, errors: [] } };

        if (!formBody.name) ans.data.errors.push('Service name is required');

        if (ans.data.errors.length <= 0) {
            const serviceExists = await this.offeredServicesService.serviceExistsWithName(formBody.name);
            if (formBody.operation != 'update' && serviceExists) {
                ans.data.errors.push(`Service already exists: '${formBody.name}'`);
            } else {
                await this.offeredServicesService.createService(formBody);
            }
        }

        if (ans.data.errors.length > 0) {
            res.render('additional_services/additional_services', ans);
            return;
        }

        res.redirect(`/services?start=${_start}&size=${_size}`);
    }

    @Get('/delete')
    async handleDelete(@Query('serviceId') serviceId: string, @Res() res: Response, @Query('start') start = '0', @Query('size') size = '50') {
        let _start: number, _size: number;
        if (isNaN(parseInt(start)))
            _start = 0;
        else _start = parseInt(start);
        if (isNaN(parseInt(size)))
            _size = 50;
        else _size = parseInt(size);
        const id = parseInt(serviceId);
        if (isNaN(id)) {
            res.status(500).send();
            return;
        }
        try {
            await this.offeredServicesService.deleteService(id);
        } catch (e) {
            res.status(500).send();
        }

        res.redirect(`/services?start=${_start}&size=${_size}`);
    }
} 
