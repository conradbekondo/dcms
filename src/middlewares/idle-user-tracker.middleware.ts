import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class IdleUserTrackerMiddleware implements NestMiddleware {
  private lastActivityTimeSubject?: number;
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
      return next();
    } else {
      res.clearCookie('Authorization');
      res.redirect(`/auth?returnUrl=${encodeURIComponent(req.url)}`);
      res.end();
    }
    next();
  }
}
