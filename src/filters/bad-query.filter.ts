import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BadQueryParamsException } from 'src/exceptions/bad-query.exception';

@Catch(BadQueryParamsException)
export class BadQueryFilter implements ExceptionFilter {
  private readonly logger = new Logger(BadQueryFilter.name);
  catch(exception: BadQueryParamsException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    this.logger.debug(`Bad request params filtered on ${req.url}`);

    const res = host.switchToHttp().getResponse<Response>();

    const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
    const entries = Object.entries(exception.queryMap).entries();
    for (const [_, [k, v]] of entries) {
      if (typeof v === 'object')
        url.searchParams.append(`${k}`, `${(JSON.stringify(v))}`);
      else
        url.searchParams.append(`${k}`, `${(v as unknown)}`);
    }
    res.redirect(url.toString());
  }
}
