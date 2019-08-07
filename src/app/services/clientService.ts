import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Tariff} from "../types/tariff";
import {LoginRequest} from "../types/types";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioParamsResponse} from "./portfolioService";

@Service("ClientService")
@Singleton
export class ClientService {

    @Inject
    private http: Http;

    private clientInfoCache: Client = null;

    async subscribeMailSubscription(): Promise<void> {
        return this.http.post("/user/subscribe");
    }

    async unsubscribeMailSubscription(): Promise<void> {
        return this.http.post("/user/unsubscribe");
    }

    async signUp(registrationRequest: RegistrationRequest): Promise<ClientInfoResponse> {
        return this.http.post("/user/register", registrationRequest);
    }

    async login(request: LoginRequest): Promise<ClientInfo> {
        const clientInfo = await this.http.post<ClientInfoResponse>("/user/login", request);
        return this.mapClientInfoResponse(clientInfo);
    }

    async restorePassword(email: string): Promise<void> {
        await this.http.post("/user/restore", email);
    }

    async getClientInfo(): Promise<Client> {
        if (!this.clientInfoCache) {
            const clientInfo = await this.http.get<ClientResponse>("/user/info");
            this.clientInfoCache = await this.mapClientResponse(clientInfo);
        }
        return this.clientInfoCache;
    }

    /**
     * Отправляет запрос на смену пароля пользователя
     * @param request запрос на смену пароля пользователя
     * @returns {Promise<void>}
     */
    async changePassword(request: ChangePasswordRequest): Promise<void> {
        await this.http.post(`/user/change-password`, request);
    }

    /**
     * Отправляет запрос на смену имени пользователя
     * @param request запрос на смену пароля пользователя
     * @returns {Promise<void>}
     */
    async changeUsername(request: ChangeUsernameRequest): Promise<void> {
        await this.http.post(`/user/change-username`, request);
    }

    /**
     * Отправляет запрос на смену E-mail пользователя
     * @param request запрос на смену E-mail пользователя
     * @returns {Promise<void>}
     */
    async changeEmail(request: ChangeEmailRequest): Promise<void> {
        await this.http.post(`/user/change-email`, request);
    }

    /**
     * Переключает на старую версию сервиса
     */
    async switchToOldVersion(): Promise<string> {
        return this.http.get<string>(`/user/switch-to-old`);
    }

    /**
     * Сбрасывает кэш информации о пользователе
     */
    resetClientInfo(): void {
        this.clientInfoCache = null;
    }

    private mapClientInfoResponse(clientInfoResponse: ClientInfoResponse): ClientInfo {
        return {
            token: clientInfoResponse.token,
            user: {
                ...clientInfoResponse.user,
                tariff: Tariff.valueByName(clientInfoResponse.user.tariff),
                portfolios: clientInfoResponse.user.portfolios.map(item => {
                    return {
                        ...item,
                        accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
                        iisType: item.iisType ? IisType.valueByName(item.iisType) : null
                    } as PortfolioParams;
                })
            }
        } as ClientInfo;
    }

    private mapClientResponse(clientResponse: ClientResponse): Client {
        return {
            ...clientResponse,
            tariff: Tariff.valueByName(clientResponse.tariff),
            portfolios: clientResponse.portfolios.map(item => {
                return {
                    ...item,
                    accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
                    iisType: item.iisType ? IisType.valueByName(item.iisType) : null
                } as PortfolioParams;
            })
        } as Client;
    }
}

/** Запрос на регистрацию пользователя */
export interface RegistrationRequest {
    /** E-mail пользователя */
    email: string;
    /** Идентификатор реферала */
    referrerId?: string;
    /** Идентификатор пользователя в google */
    googleId?: string;
    /** Источник входа пользователя */
    userEnterSourceType?: "WEB";
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
    /** Дата регистрации */
    regDate: string;
    /** Дата до которой оплачен тариф */
    paidTill: string;
    /** Признак подтвержденного email */
    emailConfirmed: string;
    /** Текущий идентификатор портфеля */
    currentPortfolioId: number;
    /** Тип вознаграждения за реферальную программу */
    referralAwardType: string;
    /** Промокод пользователя */
    promoCode: PromoCode;
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
    /** Текущий риск левел */
    riskLevel: string;
    /** Общее количество ценнных бумаг в составе всех портфелей */
    sharesCount: number;
    /** Присутствуют ли во всех портфелях пользователя сделки по иностранным акциям */
    foreignShares: boolean;
    /** Сумма выплаченного вознаграждения реферреру за партнерскую программу */
    referrerRepaidTotalAmount: string;
    /** Сумма причитаемого вознаграждения реферреру за партнерскую программу */
    referrerEarnedTotalAmount: string;
    /** Подписан ли пользователь на emeil рассылку */
    unsubscribed: boolean;
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

/** Сущность промокода */
export interface PromoCode {
    /** Идентификатор промокода */
    id: number;
    /** Значение промокода */
    val: string;
    /** Источник */
    source: string;
    /** Количество месяцев которое прибавляет промокод */
    months?: number;
    /** Скидка промокода */
    discount?: number;
    /** Идентификатор владельца */
    ownerId: number;
    /** Признак одноразовости промокода */
    oneTime: boolean;
    /** Признак Приветственного промокода */
    welcoming: boolean;
    /** Признак реферального промокода. Проставляет владельца в качестве реферала */
    referral: boolean;
    /** Срок действия промокода */
    expired?: string;
    /** Идентификатор пользователя использовавшего промокод */
    usedUserId: string;
    /** Признак выплаты вознаграждения рефереру если промокод реферальный */
    payToReferrer: boolean;
    /** Тариф устанавливаемый пользователю */
    tariff: string;
}