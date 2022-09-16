import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { OrdersController } from './controllers/orders/orders.controller';
import { UsersController } from './controllers/users/users.controller';
import { AppliedPolicy } from './entities/applied-policy.entity';
import { OrderEntryAttribute } from './entities/order-entry-attribute.entity';
import { OrderEntry } from './entities/order-entry.entity';
import { Order } from './entities/order.entity';
import { Policy } from './entities/processing-policy.entity';
import { Product } from './entities/product.entity';
import { Profile } from './entities/profile.entity';
import { Role } from "./entities/Role";
import { OfferedService } from './entities/service.entity';
import { LoginEntry } from './entities/user-login-entry.entity';
import { User } from './entities/user.entity';
import { AuthFailedFilter } from './filters/auth-failed.filter';
import { NotFoundFilter } from './filters/not-found.filter';
import injectionTokenKeys from './injection-tokens';
import { UsersService } from './services/users/users.service';
import { CategoriesController } from './controllers/categories/categories.controller';
import { CategoriesService } from './services/categories/categories.service';
import { Category } from './entities/category.entity';
import { ClientsService } from './services/clients/clients.service';
import { Client } from './entities/client.entity';
import { ClientsController } from './controllers/clients/clients.controller';
import { ProductsController } from './controllers/products/products.controller';

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
    Profile,
    Order,
    OrderEntry,
    Product,
    OfferedService,
    Policy,
    OrderEntryAttribute,
    AppliedPolicy,
    Category,
    Client,
  ],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: process.env.NODE_ENV == 'development',
  dropSchema: false
};

@Module({
  imports: [
    TypeOrmModule.forRoot(options),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/static'
    }),
    JwtModule.register({ secret: process.env.E_KEY })
  ],
  controllers: [UsersController, OrdersController, CategoriesController, ClientsController, ProductsController],
  providers: [
    UsersService,
    {
      provide: APP_FILTER,
      useClass: NotFoundFilter
    },
    {
      provide: APP_FILTER,
      useClass: AuthFailedFilter
    },
    {
      provide: injectionTokenKeys.appName,
      useValue: process.env.APP_NAME || 'DCMS'
    },
    {
      provide: injectionTokenKeys.identityMaxAge,
      useValue: parseInt(process.env.IDENTITY_MAX_AGE || '50000000')
    },
    CategoriesService,
    ClientsService
  ],
})
export class AppModule {
  constructor () {
  }
} 
