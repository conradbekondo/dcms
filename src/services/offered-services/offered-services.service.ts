import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { INewServiceDto } from 'src/dto/new-service.dto';
import { OfferedService } from 'src/entities/service.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class OfferedServicesService {
    private readonly offeredServicesRepository: Repository<OfferedService>;
    private readonly logger = new Logger(OfferedServicesService.name);
    constructor(dataSource: DataSource, private readonly userService: UsersService) {
        this.offeredServicesRepository = dataSource.getRepository(OfferedService);
    }

    async serviceExistsWithName(name: string) {
        return this.offeredServicesRepository.findOneBy({
            isDeleted: false, name
        }).then(service => service != null);
    }

    async createService({ id, name, operation, description }: INewServiceDto) {
        const service = new OfferedService();
        service.description = description?.trim();
        service.name = name?.trim();

        if (!operation) {
            const principal = await firstValueFrom(this.userService.principal$);
            const signedInUser = await this.userService.getUser(principal);
            if (!signedInUser) {
                const msg = `User principal not found`;
                this.logger.error(msg);
                throw new Error(msg);
            }

            service.creator = signedInUser;
            service.creatorId = signedInUser.id;
            return this.offeredServicesRepository.save(service);
        }
        else {
            return this.offeredServicesRepository.findOneBy({
                isDeleted: false, id: parseInt(id)
            }).then(s => {
                if (!s) {
                    const msg = `Cannot update a service which does not exist: '${id}'`;
                    this.logger.error(msg);
                    throw new Error(msg);
                }
                service.id = s.id;
                this.offeredServicesRepository.save(service);
            });
        }
    }

    async getServices(startAt: number = 0, size = 50) {
        const services: OfferedService[] = await this.offeredServicesRepository.createQueryBuilder()
            // .where('is_deleted = 0')
            .orderBy('date_created', 'DESC')
            .orderBy('last_updated', 'DESC')
            .skip(startAt * size)
            .take(size)
            .getMany();
        return services;
    }

    async deleteService(serivceId: number) {
        const service = await this.offeredServicesRepository.findOneBy({ id: serivceId });
        if (!service) {
            const msg = `Service not found: ${serivceId}`;
            throw new Error(msg);
        }

        // service.isDeleted = true;
        // service.dateDeleted = new Date(Date.now());
        return this.offeredServicesRepository.remove(service);
    }
}


