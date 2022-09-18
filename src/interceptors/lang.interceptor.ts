import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { combineLatestWith, Observable, tap } from 'rxjs';
import { LangService } from 'src/services/lang/lang.service';

@Injectable()
export class LangInterceptor implements NestInterceptor {
  constructor(private langService: LangService) { }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      combineLatestWith(this.langService.lang$),
      tap(([x, y]) => {
        console.log(x, y);
      })
    );
  }
} 
