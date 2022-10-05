import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Role } from 'src/decorators/role.decorator';
import { IClientDto } from 'src/dto/cleint.dto';
import { Roles } from 'src/entities/roles';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { ClientsService } from 'src/services/clients/clients.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('clients')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
@Role(Roles.ADMIN, Roles.STAFF, Roles.SYSTEM)
export class ClientsController extends BaseController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(
    private readonly clientService: ClientsService,
    @Inject(injectionTokenKeys.appName) appName: string,
    usersService: UsersService,
  ) {
    super(appName, usersService);
  }

  @Get()
  @Render('clients/clients')
  async viewClients() {
    const clients = await this.clientService.getClients();
    return { data: { clients: clients }, view: this.viewBag };
  }

  @Get(':id')
  async getClient(@Param('id') id: number, @Res() res: Response) {
    const client = await this.clientService.getClient(id);
    return res.json(client);
  }

  @Post()
  async storeClient(
    @Body() createClientDto: IClientDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const errors: string[] = [];

    if (!createClientDto.first_name || createClientDto.first_name.length <= 0) {
      errors.push('Client first name required');
      return res
        .status(400)
        .json({ message: 'Unable to create client.', errors: errors });
    }

    const stored = await this.clientService.createClient(createClientDto);

    if (stored.success)
      return res
        .status(201)
        .json({
          message: 'Client created successfully.',
          client: stored.client,
        });
    else return res.status(500).json({ message: stored.error });
  }

  @Put(':id')
  async updateClient(
    @Body() updateClientDto: IClientDto,
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const updated = await this.clientService.updateClient(updateClientDto, id);

    if (updated.success)
      return res.json({ message: 'Client updated successfully.' });
    else return res.status(500).json({ message: 'Unable to update client.' });
  }

  @Delete(':id')
  async deleteClient(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deleted = await this.clientService.deleteClient(id);

    if (deleted.success)
      return res.json({ message: 'Client deleted successfully.' });
    else return res.status(500).json({ message: 'Unable to delete client.' });
  }
}
