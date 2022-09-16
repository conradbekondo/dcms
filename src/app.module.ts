import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { OrdersController } from './controllers/orders/orders.controller';
import { AuthController } from './controllers/users/auth.controller';
import { AppliedPolicy } from './entities/applied-policy.entity';
import { OrderEntryAttribute } from './entities/order-entry-attribute.entity';
import { OrderEntry } from './entities/order-entry.entity';
import { Order } from './entities/order.entity';
import { Policy } from './entities/processing-policy.entity';
import { Product } from './entities/product.entity';
import { Profile } from './entities/profile.entity';
import { Role } from './entities/Role';
import { OfferedService } from './entities/service.entity';
import { LoginEntry } from './entities/user-login-entry.entity';
import { User } from './entities/user.entity';
import { AuthFailedFilter } from './filters/auth-failed.filter';
import { NotFoundFilter } from './filters/not-found.filter';
import injectionTokenKeys from './injection-tokens';
import { UsersService } from './services/users/users.service';
import { ClientsController } from './controllers/clients/clients.controller';
import { ProductsController } from './controllers/products/products.controller';
import { LangController } from './controllers/lang/lang.controller';
import { OrdersService } from './services/orders/orders.service';
import { ServicesController } from './controllers/services/services.controller';
import { OfferedServicesService } from './services/offered-services/offered-services.service';
import { UsersController } from './controllers/users/users.controller';

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
  ],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
  dropSchema: false,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(options),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/static',
    }),
    JwtModule.register({ secret: process.env.E_KEY }),
    I18n
  ],
  controllers: [
    AuthController,
    OrdersController,
    ClientsController,
    ProductsController,
    ServicesController,
    UsersController
  ],
  providers: [
    UsersService,
    OrdersService,
    OfferedServicesService,
    {
      provide: APP_FILTER,
      useClass: NotFoundFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AuthFailedFilter,
    },
    {
      provide: injectionTokenKeys.appName,
      useValue: process.env.APP_NAME || 'DCMS',
    },
    {
      provide: injectionTokenKeys.identityMaxAge,
      useValue: parseInt(process.env.IDENTITY_MAX_AGE || '5000000000'),
    },
  ],
})
export class AppModule { }
