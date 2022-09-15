import { Injectable, Logger } from '@nestjs/common';
import { INewServiceDto } from 'src/dto/new-service.dto';
import { OfferedService } from 'src/entities/service.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OfferedServicesService {
    private readonly offeredServicesRepository: Repository<OfferedService>;
    private readonly logger = new Logger(OfferedServicesService.name);
    constructor (dataSource: DataSource) {
        this.offeredServicesRepository = dataSource.getRepository(OfferedService);
    }

    async serviceExistsWithName(name: string) {
        return this.offeredServicesRepository.findOneBy({
            isDeleted: false, name
        }).then(service => service != null);
    }

    async createService({ name, standardPrice, description, processingDuration }: INewServiceDto) {
        const service = new OfferedService();
        service.description = description;
        service.name = name;
        // service.standardPrice = parseFloat(standardPrice);
        const _standardPrice = parseFloat(standardPrice);
        if (isNaN(_standardPrice)) {
            service.standardPrice = 0;
        } else service.standardPrice = _standardPrice;

        const _processingDuration = parseFloat(processingDuration);
        if (isNaN(_processingDuration)) {
            service.processingDuration = 1;
        } else service.processingDuration = _processingDuration;

        return this.offeredServicesRepository.findOneBy({
            isDeleted: false, name
        }).then(async s => {
            if (!s) {
                return this.offeredServicesRepository.save(service)
            } else {
                return this.offeredServicesRepository.delete(s).then(r => {
                    this.offeredServicesRepository.save(service);
                });
            }
        });
    }

    async getServices(startAt: number = 0, size = 50) {
        const services: OfferedService[] = await this.offeredServicesRepository.createQueryBuilder()
            .orderBy('date_created', 'DESC')
            .skip(startAt * size)
            .take(size)
            .execute();
        return services;
    }
}


