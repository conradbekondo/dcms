import { UsersService } from 'src/services/users/users.service';

export abstract class BaseController {
  protected viewBag: { [key: string]: any };
  protected constructor(
    protected readonly appName: string,
    protected userService: UsersService,
  ) {
    this.viewBag = {};
    this.viewBag['appName'] = appName;
    this.viewBag.releaseDate =
      process.env.NODE_ENV == 'production'
        ? new Date()
        : new Date(Date.parse(process.env.RELEASE_DATE));
    userService.principal$.subscribe((principal) => {
      this.viewBag.principal = principal;
    });
  }
}
