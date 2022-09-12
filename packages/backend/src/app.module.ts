import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UsersController } from './controllers/users/users.controller';
import { Account } from './entities/account.entity';
import { Item } from './entities/item.entity';
import { OfferedService } from './entities/offered-service.entity';
import { Order } from './entities/order.entity';
import { Payment } from './entities/payment.entity';
import { Permission } from './entities/permission.entity';
import { Policy } from './entities/policy.entity';
import { Profile } from './entities/profile.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UsersService } from './services/users/users.service';

const options: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  entities: [
    Account,
    Item,
    Order,
    Profile,
    Payment,
    Permission,
    Policy,
    Role,
    OfferedService,
    User
  ],
  namingStrategy: new SnakeNamingStrategy()
};

@Module({
  imports: [
    TypeOrmModule.forRoot(options)
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule { } 
