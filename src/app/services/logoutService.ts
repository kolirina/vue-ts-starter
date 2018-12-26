import {Container, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {Storage} from "../platform/services/storage";
import {StoreKeys} from "../types/storeKeys";

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

@Service("LogoutService")
@Singleton
export class LogoutService {

    async logout(): Promise<void> {
        console.log("BEFORE LOGOUT");
        await HTTP.INSTANCE.post("/user/logout");
        localStorage.delete(StoreKeys.STORE_KEY);
        localStorage.delete(StoreKeys.TOKEN_KEY);
        window.location.assign( "http://localhost:8080/auth.html");
    }
}
