import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {Storage} from "../platform/services/storage";
import {StoreKeys} from "../types/storeKeys";
import {Tariff} from "../types/tariff";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioParamsResponse} from "./portfolioService";

@Service("ClientService")
@Singleton
export class ClientService {

    clientInfo: ClientInfo = null;

    @Inject
    private localStorage: Storage;

    async getClientInfo(): Promise<ClientInfo> {
        if (!this.clientInfo) {
            const result = await HTTP.INSTANCE.get("/user/info");
            const clientInfo: ClientResponse = await result.data;
            this.clientInfo = {
                token: this.localStorage.get(StoreKeys.TOKEN_KEY, null),
                user: {
                    ...clientInfo,
                    tariff: Tariff.valueByName(clientInfo.tariff),
                    portfolios: clientInfo.portfolios.map(item => {
                        return {
                            ...item,
                            accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
                            iisType: item.iisType ? IisType.valueByName(item.iisType) : null
                        } as PortfolioParams;
                    })
                }
            } as ClientInfo;
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

export interface ClientInfo {
    token: string;
    user: Client;
}

export interface ClientInfoResponse {
    token: string;
    user: ClientResponse;
}

export interface BaseClient {
    /** Идентификатор пользователя */
    id: string;
    /** Логин пользователя */
    username: string;
    /** email пользователя */
    email: string;
    /** Дата; до которой оплачен тариф */
    paidTill: string;
    /** Признак подтвержденного email */
    emailConfirmed: string;
    /** Текущий идентификатор портфеля */
    currentPortfolioId: string;
    /** Тип вознаграждения за реферальную программу */
    referralAwardType: string;
    /** Промо-код пользователя */
    promoCode: string;
    /** Признак блокировки аккаунта */
    blocked: boolean;
    /** Алиас для реферальной ссылки */
    referralAlias: string;
    /** Сумма подлежащая выплате по реферальной программе */
    earnedTotalAmount: string;
    /** Срок действия скидки */
    nextPurchaseDiscountExpired: string;
    /** Индивидуальная скидка на следующую покупку в системе */
    nextPurchaseDiscount: number;
    /** Количество портфелей в профиле пользователя */
    portfoliosCount: number;
    /** Общее количество ценнных бумаг в составе всех портфелей */
    sharesCount: number;
    /** Присутствуют ли во всех портфелях пользователя сделки по иностранным акциям */
    foreignShares: boolean;
    /** Сумма выплаченного вознаграждения реферреру за партнерскую программу */
    referrerRepaidTotalAmount: string;
    /** Сумма причитаемого вознаграждения реферреру за партнерскую программу */
    referrerEarnedTotalAmount: string;
}

export interface ClientResponse extends BaseClient {
    /** Список портфелей */
    portfolios: PortfolioParamsResponse[];
    /** Тариф */
    tariff: string;
}

export interface Client extends BaseClient {
    /** Список портфелей */
    portfolios: PortfolioParams[];
    /** Тариф */
    tariff: Tariff;
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
