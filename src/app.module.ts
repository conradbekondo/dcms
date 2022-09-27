import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BackupController } from './backup/backup.controller';
import { CategoriesController } from './controllers/categories/categories.controller';
import { ClientsController } from './controllers/clients/clients.controller';
import { LangController } from './controllers/lang/lang.controller';
import { OrdersController } from './controllers/orders/orders.controller';
import { ProductsController } from './controllers/products/products.controller';
import { ServicesController } from './controllers/services/services.controller';
import { AuthController } from './controllers/users/auth.controller';
import { UsersController } from './controllers/users/users.controller';
import { Category } from './entities/category.entity';
import { Client } from './entities/client.entity';
import { InvoiceItemAdditionalService } from './entities/invoice-item-additional-service.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from './entities/invoice.entity';
import { OrderEntryAttribute } from './entities/order-entry-attribute.entity';
import { OrderEntry } from './entities/order-entry.entity';
import { Order } from './entities/order.entity';
import { PricedCategoriesView } from './entities/priced-categories.view.entity';
import { ProductServicePrice } from './entities/product-service-price.entity';
import { Product } from './entities/product.entity';
import { Profile } from './entities/profile.entity';
import { Role } from './entities/Role';
import { OfferedService } from './entities/service.entity';
import { LoginEntry } from './entities/user-login-entry.entity';
import { User } from './entities/user.entity';
import { AuthFailedFilter } from './filters/auth-failed.filter';
import { CreateUserFailedFilter } from './filters/create-user-failed.filter';
import { NotFoundFilter } from './filters/not-found.filter';
import { RoleCheckFailedFilter } from './filters/role-check-failed.filter';
import injectionTokenKeys from './injection-tokens';
import { IdleUserTrackerMiddleware } from './middlewares/idle-user-tracker.middleware';
import { CategoriesService } from './services/categories/categories.service';
import { ClientsService } from './services/clients/clients.service';
import { OfferedServicesService } from './services/offered-services/offered-services.service';
import { OrdersService } from './services/orders/orders.service';
import { ProductsService } from './services/products/products.service';
import { UsersService } from './services/users/users.service';

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
    OrderEntryAttribute,
    Category,
    Client,
    ProductServicePrice,
    PricedCategoriesView,
    Invoice,
    InvoiceItem,
    InvoiceItemAdditionalService
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
    I18nModule.forRoot({
      fallbackLanguage: process.env.SYSTEM_LANG || 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
    }),
  ],
  controllers: [
    AuthController,
    OrdersController,
    ServicesController,
    UsersController,
    CategoriesController,
    ClientsController,
    ProductsController,
    ServicesController,
    UsersController,
    LangController,
    BackupController,
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
      provide: APP_FILTER,
      useClass: CreateUserFailedFilter,
    },
    {
      provide: APP_FILTER,
      useClass: RoleCheckFailedFilter,
    },
    {
      provide: injectionTokenKeys.appName,
      useValue: process.env.APP_NAME || 'DCMS',
    },
    {
      provide: injectionTokenKeys.identityMaxAge,
      useValue: parseInt(process.env.IDENTITY_MAX_AGE || '50000000'),
    },
    CategoriesService,
    ClientsService,
    ProductsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdleUserTrackerMiddleware).forRoutes('*');
  }
}
