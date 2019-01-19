import {Container, Inject, Singleton} from "typescript-ioc";
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
        console.log("BEFORE LOGOUT");
        await this.http.post("/user/logout");
        this.localStorage.delete(StoreKeys.STORE_KEY);
        this.localStorage.delete(StoreKeys.TOKEN_KEY);
        window.location.assign( "http://localhost:8080/auth.html");
    }
}
