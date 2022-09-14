import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), `.${process.env.NODE_ENV}.env`) });

import { NestFactory } from '@nestjs/core';
import { from, switchMap, tap } from 'rxjs';
import { AppModule } from 'src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';


function bootstrap() {
    return from(NestFactory.create<NestExpressApplication>(AppModule)).pipe(
        tap(app => {
            app.enableCors();
            app.useStaticAssets(join(process.cwd(), 'public'));
            app.setBaseViewsDir(join(process.cwd(), 'views'));
            app.setViewEngine('ejs');
        }),
        switchMap(app => from(app.listen(parseInt(process.env.APP_PORT))))
    );
}


bootstrap().subscribe(() => {
});