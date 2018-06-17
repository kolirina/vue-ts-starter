import axios from 'axios';
import {Storage} from './storage';
import {Container} from "typescript-ioc";

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);
/** Ключ под которым хранится токен пользователя */
const TOKEN_KEY = "INTELINVEST_TOKEN";
const token = localStorage.get(TOKEN_KEY, null);

export const HTTP = axios.create({
    baseURL: `${window.location.protocol}//${window.location.host}/api`,
    headers: {
        Authorization: token ? `Bearer ${token}` : '',
        ContentType: 'application/json'
    }
});
