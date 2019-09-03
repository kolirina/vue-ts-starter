import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";
import {Tariff} from "../types/tariff";

@Service("TariffService")
@Singleton
export class TariffService {

    @Inject
    private http: Http;

    /**
     * Отправляет запрос на создание заказа для оплаты тарифа
     * @param tariff выбранный тариф
     * @param monthly признак оплаты за месяц
     */
    async makePayment(tariff: Tariff, monthly: boolean): Promise<TinkoffPaymentOrderResponse> {
        return this.http.post<TinkoffPaymentOrderResponse>("/tariff/payment", {tariff: tariff.name, monthly});
    }

    /**
     * Применяет промокод
     * @param promoCode промокод
     */
    async applyPromoCode(promoCode: string): Promise<void> {
        await this.http.post(`/tariff/apply-promo-code/${promoCode}`);
    }

    async getPaymentInfo(): Promise<UserPaymentInfo> {
        return this.http.get<UserPaymentInfo>("/tariff/payment-info");
    }

    /**
     * Отменяет текущую подписку и отвязывает карту
     * @param request запрос
     */
    async cancelOrderSchedule(request: CancelOrderRequest): Promise<void> {
        return this.http.post("/tariff/cancel-order-schedule", request);
    }
}

/** Запрос на оплату тарифа */
export interface PayTariffRequest {
    /** Оплачиваемый тариф */
    tariff: Tariff;
    /** Признак оплаты за месяц. */
    monthly: boolean;
}

/** Ответ на оплату тарифа */
export interface PayTariffResponse {
    /** Оплачиваемый заказ */
    paymentOrder: PaymentOrder;
    /** Ключ терминала для оплаты */
    terminalKey: string;
}

/**
 * Сущность ответа от платежного шлюза Тинькоф
 */
export interface TinkoffPaymentOrderResponse {
    /** Идентификатор терминала, выдается Продавцу Банком */
    terminalKey: string;
    /** Сумма в копейках */
    amount: number;
    /** Номер заказа в системе Продавца */
    orderId: string;
    /** Успешность операции */
    success: boolean;
    /** Статус транзакции */
    status: string;
    /** Уникальный идентификатор транзакции в системе Банка */
    paymentId: string;
    /** Код ошибки, «0» - если успешно */
    errorCode: string;
    /** Ссылка на страницу оплаты. По умолчанию ссылка доступна в течении 24 часов. */
    paymentURL?: string;
    /** Краткое описание ошибки */
    message?: string;
    /** Подробное описание ошибки */
    details?: string;
}

/** Информация об оплате тарифа */
export interface PaymentOrder {
    /** Идентификатор пользователя */
    userId: string;
    /** Идентификатор заказа в системе */
    orderId: string;
    /** Оплачиваемый тариф */
    tariff: Tariff;
    /** Сумма оплаты в копейках */
    amount: number;
    /** Оплачиваемый период. Количество месяцев */
    period: number;
    /** Признак завершенного заказа */
    done: boolean;
}

/** Данные для оплаты заказа в эквайринге */
export interface PaymentParams {
    /** Код терминала (обязательный параметр), выдается банком. */
    TerminalKey: string;
    /** Сумма заказа в копейках (обязательный параметр) */
    Amount: number;
    /** Номер заказа (если не передан, принудительно устанавливается timestamp) */
    OrderId: string;
    /** Описание заказа (не обязательный параметр */
    Description: string;
    /** Дополнительные параметры платежа */
    DATA: string;
    /** Флаг открытия платежной формы во фрейме */
    Frame: boolean;
}

/** Поля, содержащию информацию о способе оплаты подписки пользователя */
export interface UserPaymentInfo {
    /** Маскированный номер карты в виде **** 1234 */
    pan: string;
    /** Срок действия карты */
    expDate: string;
}

/** Сущность с данными при отвзяке карты */
export interface CancelOrderRequest {
    /** Тип ответа */
    answer: string;
    /** Комментарий к ответу */
    comment?: string;
}
/** Перечисление возможных типов ответов при отвязке карты */
@Enum("code")
export class UnLinkCardAnswer extends (EnumType as IStaticEnum<UnLinkCardAnswer>) {

    static readonly REDUCE_INVEST_ACTIVITY = new UnLinkCardAnswer("REDUCE_INVEST_ACTIVITY", "Прекратил или уменьшил инвесторскую деятельность");
    static readonly ABSENT_FUNCTIONALITY = new UnLinkCardAnswer("ABSENT_FUNCTIONALITY", "Нет нужной мне функционаьности");
    static readonly ERRORS = new UnLinkCardAnswer("ERRORS", "Ошибки в сервисе");
    static readonly SUPPORT_QUALITY = new UnLinkCardAnswer("SUPPORT_QUALITY", "Не устроило качество обратной связи от тех. поддержки");
    static readonly EXPENSIVE_TARIFFS = new UnLinkCardAnswer("EXPENSIVE_TARIFFS", "Дорогие тарифные планы");
    static readonly STOP_AUTO_PAYMENTS = new UnLinkCardAnswer("STOP_AUTO_PAYMENTS", "Автопродление не требуется. Предпочитаю оплачивать самостоятельно.");
    static readonly OTHER = new UnLinkCardAnswer("OTHER", "Другое");

    private constructor(public code: string, public description: string) {
        super();
    }
}