import {Inject, Singleton} from "typescript-ioc";
import * as tinkoff from "../../assets/js/tinkoff";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Tariff} from "../types/tariff";
import {ClientInfo} from "./clientService";

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
    async makePayment(tariff: Tariff, monthly: boolean): Promise<PayTariffResponse> {
        return this.http.post<PayTariffResponse>("/tariff/payment", {tariff: tariff.name, monthly});
    }

    /**
     * Применяет промокод
     * @param promoCode промокод
     */
    async applyPromoCode(promoCode: string): Promise<void> {
        await this.http.post(`/tariff/apply-promo-code/${promoCode}`);
    }

    openPaymentFrame(order: PayTariffResponse, clientInfo: ClientInfo): void {
        const params: PaymentParams = {
            TerminalKey: order.terminalKey,
            Amount: order.paymentOrder.amount,
            OrderId: order.paymentOrder.orderId,
            Description: `Оплата тарифного плана ${order.paymentOrder.tariff.name}`,
            DATA: `Email=${clientInfo.user.email}|Name=${clientInfo.user.username}`,
            Frame: true
        };
        tinkoff.doPay(params);
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
