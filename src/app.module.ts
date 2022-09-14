import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UsersController } from './controllers/users/users.controller';
import { User } from './entities/user.entity';
import { Role } from "./entities/Role";
import { NotFoundFilter } from './filters/not-found.filter';
import { UsersService } from './services/users/users.service';
import { LoginEntry } from './entities/user-login-entry.entity';

const options: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Role,
    LoginEntry
  ],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
  dropSchema: true
};

@Module({
  imports: [
    TypeOrmModule.forRoot(options),

  ],
  controllers: [UsersController],
  providers: [UsersService,
    {
      provide: APP_FILTER,
      useClass: NotFoundFilter
    }],
})
export class AppModule { } 
