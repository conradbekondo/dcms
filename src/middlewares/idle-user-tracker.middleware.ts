import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class IdleUserTrackerMiddleware implements NestMiddleware {
  private lastActivityTimeSubject?: number;
  private logger: Logger = new Logger(IdleUserTrackerMiddleware.name);
  constructor(@Inject(injectionTokenKeys.identityMaxAge) private readonly maxAge: number,
    private userService: UsersService) {
    this.lastActivityTimeSubject = null;
  }

  use(req: Request, res: Response, next: () => void) {
    if (!this.userService.getPrincipal()) return next();
    const now = Date.now();
    if (!this.lastActivityTimeSubject) {
      this.lastActivityTimeSubject = now;
      return next();
    }

    if (this.lastActivityTimeSubject + this.maxAge >= now) {
      this.lastActivityTimeSubject = now;
      this.logger.debug(`Last active time updated => ${new Date(this.lastActivityTimeSubject).toLocaleString()}`);
      return next();
    } else {
      res.clearCookie('Authorization');
      res.redirect(`/auth?returnUrl=${encodeURIComponent(req.url)}`);
      res.end();
    }
    next();
  }
}
