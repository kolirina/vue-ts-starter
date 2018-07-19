// tslint:disable
declare module "typescript-ioc" {
    export class Container {
        static get<T>(arg: { new (): T } | Function): T;
    }
}
// tslint:enable