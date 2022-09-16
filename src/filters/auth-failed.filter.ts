import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ForbiddenException)
export class AuthFailedFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    response.redirect(`/auth?returnUrl=${encodeURIComponent(request.url)}`);
  }
}
