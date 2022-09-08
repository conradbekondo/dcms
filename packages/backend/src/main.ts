import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), `.${process.env.NODE_ENV}.env`) });

import { NestFactory } from '@nestjs/core';
import { from, switchMap } from 'rxjs';
import { AppModule } from 'src/app.module';


function bootstrap() {
    return from(NestFactory.create(AppModule)).pipe(
        switchMap(app => from(app.listen(parseInt(process.env.APP_PORT))))
    );
}


bootstrap().subscribe(() => {
});