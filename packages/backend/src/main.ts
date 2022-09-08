import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { join } from 'path';
import { from, switchMap } from 'rxjs';
import { AppModule } from 'src/app.module';

function bootstrap() {
    return from(NestFactory.create(AppModule)).pipe(
        switchMap(app => from(app.listen(parseInt(process.env.APP_PORT))))
    );
}

config({ path: join(process.cwd(), `.${process.env.NODE_ENV}.env`) });

bootstrap().subscribe(() => {
});