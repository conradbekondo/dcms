import { Injectable, Logger } from '@nestjs/common';
import { INewServiceDto } from 'src/dto/new-service.dto';
import { OfferedService } from 'src/entities/service.entity';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class OfferedServicesService {
  private readonly offeredServicesRepository: Repository<OfferedService>;
  private readonly logger = new Logger(OfferedServicesService.name);
  constructor(
    private dataSource: DataSource,
    private readonly userService: UsersService,
  ) {
    this.offeredServicesRepository = dataSource.getRepository(OfferedService);
  }

  async serviceExistsWithName(name: string) {
    return this.offeredServicesRepository
      .findOneBy({
        name,
      })
      .then((service) => service != null);
  }

  async createService({
    id,
    name,
    operation,
    isAdditional,
    description,
  }: INewServiceDto) {
    const service = new OfferedService();
    service.description = description?.trim();
    service.name = name?.trim();
    service.isAdditional = isAdditional == 'true';

    if (!operation) {
      const principal = this.userService.getPrincipal();
      const signedInUser = await this.userService.getUser(principal);
      if (!signedInUser) {
        const msg = `User principal not found`;
        this.logger.error(msg);
        throw new Error(msg);
      }

      service.creator = signedInUser;
      service.creatorId = signedInUser.id;
      return this.offeredServicesRepository.save(service);
    } else {
      return this.offeredServicesRepository
        .findOneBy({
          id: parseInt(id),
        })
        .then((s) => {
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

  async getServices(startAt: number = 0, size = 50, additionaOnly?: boolean) {
    let query: FindManyOptions<OfferedService> = {
      relations: { creator: true },
      skip: startAt * size,
      take: size,
      order: {
        dateCreated: 'DESC',
        lastUpdated: 'DESC',
      },

    };
    if (additionaOnly === true || additionaOnly === false) {
      query = {
        ...query, where: {
          isAdditional: additionaOnly
        }
      };
    }
    const services: OfferedService[] =
      await this.offeredServicesRepository.find(query);
    return services;
  }

  async getAdditional(startAt: number = 0, size: number = 50) {
    const services: OfferedService[] =
      await this.offeredServicesRepository.find({
        where: {
          isAdditional: true,
        },
        relations: { creator: true },
        order: {
          dateCreated: 'desc',
          lastUpdated: 'desc',
        },
        skip: startAt * size,
        take: size,
      });
    return services;
  }

  async deleteService(serivceId: number) {
    const service = await this.offeredServicesRepository.findOneBy({
      id: serivceId,
    });
    if (!service) {
      const msg = `Service not found: ${serivceId}`;
      throw new Error(msg);
    }

    // service.isDeleted = true;
    // service.dateDeleted = new Date(Date.now());
    return this.offeredServicesRepository.remove(service);
  }
}
