import axios, {AxiosInstance} from "axios";
import {Container} from "typescript-ioc";
import {UI} from "../../app/ui";
import {LogoutService} from "../../services/logoutService";
import {EventType} from "../../types/eventType";
import {StoreKeys} from "../../types/storeKeys";
import {Storage} from "./storage";

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

export class HTTP {

    static _INSTANCE: AxiosInstance = null;

    static init(): void {
        const token = localStorage.get(StoreKeys.TOKEN_KEY, null);
        HTTP._INSTANCE = axios.create({
            baseURL: `${window.location.protocol}//${window.location.host}/api`,
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        HTTP._INSTANCE.interceptors.response.use((response) => response,
            (error): Promise<any> => {
                if (error.response.status === 401) {
                    (Container.get(LogoutService) as LogoutService).logout();
                }
                let message: string = error;
                if (error.response.data && error.response.data.errorMessage) {
                    message = error.response.data.errorMessage;
                }
                UI.emit(EventType.HANDLE_ERROR, message ? new Error(message) : error);
                return Promise.reject(message ? new Error(message) : error);
            });
    }

    static get INSTANCE(): AxiosInstance {
        if (!HTTP._INSTANCE) {
            HTTP.init();
        }
        return HTTP._INSTANCE;
    }

}
