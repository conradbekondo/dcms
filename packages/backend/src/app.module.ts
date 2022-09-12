import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersController } from './controllers/users/users.controller';
import { Account } from './entities/account.entity';
import { Item } from './entities/item.entity';
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
    Item
  ]
};

@Module({
  imports: [
    TypeOrmModule.forRoot(options)
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule { } 
