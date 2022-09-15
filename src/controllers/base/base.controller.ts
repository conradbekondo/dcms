export abstract class BaseController {
    protected viewBag: { [key: string]: any };
    protected constructor (protected readonly appName: string) {
        this.viewBag = {};
        this.viewBag['appName'] = appName;
        this.viewBag.releaseDate = process.env.NODE_ENV == 'development' ? new Date() : Date.parse(process.env.RELEASE_DATE);
    }
}