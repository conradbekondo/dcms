import { Injectable, Logger } from '@nestjs/common';
import { IClientDto } from 'src/dto/client.dto';
import { Client } from 'src/entities/client.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class ClientsService {
  private readonly clientRepository: Repository<Client>;
  private readonly logger = new Logger(ClientsService.name);

  constructor(datasource: DataSource) {
    this.clientRepository = datasource.getRepository(Client);
  }

  /**
   * Store newly created client.
   *
   * @param dto New client data
   * @returns
   */
  async createClient(dto: IClientDto) {
    const exists = await this.clientRepository.findOneBy({ phone: dto.phone });

    if (exists) {
      this.logger.warn(
        `Failed client creation attempt - Client with same phone number already exists.`,
      );
      return { success: false, error: 'Client already exists' };
    }

    let client = new Client();
    client.first_name = dto.first_name;
    client.last_name = dto.last_name;
    client.phone = dto.phone;
    client.email = dto.email;
    client.address = dto.address;
    client = await this.clientRepository.save(client);

    this.logger.log(`New client created with ID #${client.id}`);

    return { success: true, client: client };
  }

  /**
   * Get clients index.
   *
   * @returns
   */
  async getClients() {
    const clients = await this.clientRepository.find();
    return clients;
  }

  /**
   * Get given client data.
   *
   * @param id
   * @returns
   */
  async getClient(id: number) {
    const client = await this.clientRepository.findOneBy({ id: id });
    return client;
  }

  /**
   * Update the given client.
   *
   * @param dto New client data
   * @param id Client to update
   * @returns
   */
  async updateClient(dto: IClientDto, id: number) {
    const client = await this.clientRepository.findOneBy({ id: id });

    client.first_name = dto.first_name;
    client.last_name = dto.last_name;
    client.phone = dto.phone;
    client.email = dto.email;
    client.address = dto.address;

    await this.clientRepository.save(client);
    this.logger.log(`Client with ID #${client.id} updated`);

    return { success: true, client: client };
  }

  /**
   * Delete the given client.
   *
   * @param id Client to delete
   * @returns
   */
  async deleteClient(id: number) {
    const client = await this.clientRepository.findOneBy({ id: id });

    if (client) {
      await this.clientRepository.delete(id);
      return { success: true };
    } else {
      return { success: false, error: "Client doesn't exists" };
    }
  }
}
