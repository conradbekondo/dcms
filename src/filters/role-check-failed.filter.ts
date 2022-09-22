import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ForbiddenException)
export class RoleCheckFailedFilter<T> implements ExceptionFilter {
  catch(_: ForbiddenException, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();
    const request: Request = host.switchToHttp().getRequest();
    response.render('forbidden', {
      view: { appName: null, requestedResource: `${request.url}` },
    });
  }
}
