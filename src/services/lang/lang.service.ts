import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class LangService {
  private readonly langSubject: BehaviorSubject<'en' | 'fr'>;
  constructor() {
    this.langSubject = new BehaviorSubject<'en' | 'fr'>(
      (process.env.SYSTEM_LANG as 'en' | 'fr') || 'en',
    );
  }

  set lang(lang: 'en' | 'fr') {
    this.langSubject.next(lang);
  }

  get lang$(): Observable<'en' | 'fr'> {
    return this.langSubject.asObservable();
  }
}
