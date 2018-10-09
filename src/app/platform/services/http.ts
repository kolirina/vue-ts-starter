import axios, {AxiosInstance} from 'axios';
import {Container} from 'typescript-ioc';
import {StoreKeys} from '../../types/storeKeys';
import {Storage} from './storage';

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

export class HTTP {

    static _INSTANCE: AxiosInstance = null;

    static init(): void {
        const token = localStorage.get(StoreKeys.TOKEN_KEY, null);
        HTTP._INSTANCE = axios.create({
            baseURL: `${window.location.protocol}//${window.location.host}/api`,
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });
    }

    static get INSTANCE(): AxiosInstance {
        if (!HTTP._INSTANCE) {
            HTTP.init();
        }
        return HTTP._INSTANCE;
    }

}
