import axios from "axios";
import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {ClientInfo, LoginRequest} from "../types/types";

@Service("ClientService")
@Singleton
export class ClientService {

    clientInfo: ClientInfo = null;

    async getClientInfo(request: LoginRequest): Promise<ClientInfo> {
        if (!this.clientInfo) {
            const result = await axios.post("/api/user/login", request);
            this.clientInfo = await result.data as ClientInfo;
        }
        return this.clientInfo;
    }

    /**
     * Отправляет запрос на смену пароля пользователя
     * @param request запрос на смену пароля пользователя
     * @returns {Promise<void>}
     */
    async changePassword(request: ChangePasswordRequest): Promise<void> {
        await HTTP.INSTANCE.post(`/user/change-password`, request);
    }

    /**
     * Отправляет запрос на смену имени пользователя
     * @param request запрос на смену пароля пользователя
     * @returns {Promise<void>}
     */
    async changeUsername(request: ChangeUsernameRequest): Promise<void> {
        await HTTP.INSTANCE.post(`/user/change-username`, request);
    }

    /**
     * Отправляет запрос на смену E-mail пользователя
     * @param request запрос на смену E-mail пользователя
     * @returns {Promise<void>}
     */
    async changeEmail(request: ChangeEmailRequest): Promise<void> {
        await HTTP.INSTANCE.post(`/user/change-email`, request);
    }
}

/** Запрос на смену пароля пользователя */
export interface ChangePasswordRequest {
    /** E-mail пользователя */
    email: string;
    /** Текущий пароль пользователя */
    password: string;
    /** Новый пароль пользователя */
    newPassword: string;
    /** Повтор нового пароля пользователя */
    confirmPassword: string;
}

/** Запрос на смену имени пользователя */
export interface ChangeUsernameRequest {
    /** Идентификатор пользователя */
    id: string;
    /** Новое имя пользователя пользователя */
    username: string;
}

/** Запрос на смену E-mail пользователя */
export interface ChangeEmailRequest {
    /** Идентификатор пользователя */
    id: string;
    /** E-mail пользователя */
    email: string;
}