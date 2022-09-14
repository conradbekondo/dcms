import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersService {
    private readonly repository: Repository<User>;

    constructor (datasource: DataSource) {
        this.repository = datasource.getRepository(User);
    }
}
