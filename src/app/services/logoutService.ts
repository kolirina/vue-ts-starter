import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Storage} from "../platform/services/storage";
import {StoreKeys} from "../types/storeKeys";

@Service("LogoutService")
@Singleton
export class LogoutService {

    @Inject
    private http: Http;
    @Inject
    private localStorage: Storage;

    async logout(): Promise<void> {
        await this.http.post("/user/logout");
        this.localStorage.delete(StoreKeys.TOKEN_KEY);
        this.localStorage.delete(StoreKeys.BACKEND_VERSION_KEY);
        window.location.assign(location.origin + location.pathname);
    }
}
