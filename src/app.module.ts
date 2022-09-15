import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UsersController } from './controllers/users/users.controller';
import { Profile } from './entities/profile.entity';
import { Role } from "./entities/Role";
import { LoginEntry } from './entities/user-login-entry.entity';
import { User } from './entities/user.entity';
import { NotFoundFilter } from './filters/not-found.filter';
import injectionTokenKeys from './injection-tokens';
import { UsersService } from './services/users/users.service';
import { IndexController } from './controllers/index/index.controller';

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
    LoginEntry,
    Profile
  ],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: process.env.NODE_ENV == 'development',
  dropSchema: process.env.NODE_ENV == 'development'
};

@Module({
  imports: [
    TypeOrmModule.forRoot(options),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/static'
    })
  ],
  controllers: [UsersController, IndexController],
  providers: [
    UsersService,
    {
      provide: APP_FILTER,
      useClass: NotFoundFilter
    },
    {
      provide: injectionTokenKeys.appName,
      useValue: process.env.APP_NAME || 'DCMS'
    }
  ],
})
export class AppModule {
  constructor () {
  }
} 
