import {
  ArgumentsHost,
  Catch,
  ExceptionFilter, InternalServerErrorException
} from '@nestjs/common';
import { Response } from 'express';

@Catch(InternalServerErrorException)
export class ServerErrorFilter<T> implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const message = exception.getResponse();
    response.render('server-error', { view: { error: message } });
  }
}
