import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), `.${process.env.NODE_ENV}.env`) });

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { from, switchMap, tap } from 'rxjs';
import { AppModule } from 'src/app.module';
import { AuthFailedFilter } from './filters/auth-failed.filter';
import { RoleCheckFailedFilter } from './filters/role-check-failed.filter';
import { ServerErrorFilter } from './filters/server-error.filter';

function bootstrap() {
    return from(NestFactory.create<NestExpressApplication>(AppModule)).pipe(
        tap(app => {
            app.enableCors();
            // app.use('/static', express.static(join(process.cwd(), 'public')))
            app.useStaticAssets(join(process.cwd(), 'public'));
            app.setBaseViewsDir(join(process.cwd(), 'views'));
            app.useGlobalFilters(new ServerErrorFilter(), new AuthFailedFilter(), new RoleCheckFailedFilter());
            app.enableCors({ origin: '*' });
            app.use(cookieParser());
            app.setViewEngine('ejs');
        }),
        switchMap(app => from(app.listen(parseInt(process.env.APP_PORT))))
    );
}


bootstrap().subscribe(() => {
});