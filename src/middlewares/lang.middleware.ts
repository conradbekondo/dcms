import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LangMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    next();
  }
}
