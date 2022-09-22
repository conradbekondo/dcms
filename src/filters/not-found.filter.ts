import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { renderFile } from 'ejs';
import { Response } from 'express';
import { join } from 'path';

@Catch(NotFoundException)
export class NotFoundFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response: Response = context.getResponse();
    const path = join(process.cwd(), 'views', 'not-found.ejs');
    renderFile(path, { exception }).then((s) => response.status(404).send(s));
  }
}
