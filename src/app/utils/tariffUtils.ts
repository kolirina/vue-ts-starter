/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Client, ClientInfo} from "../services/clientService";
import {Tariff} from "../types/tariff";
import {DateUtils} from "./dateUtils";

export class TariffUtils {

    private constructor() {
    }

    /**
     * Возвращает признак того что для пользователя действует скидка. При соблюдении условий:
     * <ul>
     *     <il>Дата истечения скидки равна {@code null} или больше текущей даты</il>
     *     <il>скидка больше 0</il>
     * </ul>
     * @return признак того что для пользователя действует скидка
     */
    static isDiscountApplied(clientInfo: ClientInfo): boolean {
        const nextPurchaseDiscountExpired = DateUtils.parseDate(clientInfo.user.nextPurchaseDiscountExpired);
        return (clientInfo.user.nextPurchaseDiscountExpired == null || dayjs().isBefore(nextPurchaseDiscountExpired)) &&
            clientInfo.user.nextPurchaseDiscount > 0;
    }

    static isTariffExpired(clientInfo: Client): boolean {
        const paidTill = DateUtils.parseDate(clientInfo.paidTill);
        const currentDate = dayjs();
        return clientInfo.tariff !== Tariff.FREE && paidTill.isBefore(currentDate) && !paidTill.isSame(currentDate, "date");
    }

    /**
     * Проверяет лимиты тарифа с учетом того что пользователя старого Стандарта будут работать без лимита по бумага до определенной даты
     * @param clientInfo информация о клиенте
     */
    static limitsExceeded(clientInfo: Client): boolean {
        const skipCheckSharesLimit = clientInfo.tariff === Tariff.STANDARD && clientInfo.skipTariffValidationDate &&
            DateUtils.parseDate(clientInfo.skipTariffValidationDate).isAfter(DateUtils.parseDate(DateUtils.currentDate()));
        return clientInfo.portfoliosCount > clientInfo.tariff.maxPortfoliosCount ||
            (!skipCheckSharesLimit && clientInfo.portfolios.some(portfolio => portfolio.sharesCount > clientInfo.tariff.maxSharesCount));
    }

    /**
     * Проверяет лимиты тарифа
     * @param clientInfo информация о клиенте
     * @param tariff тариф
     */
    static limitsExceededByTariff(clientInfo: Client, tariff: Tariff): boolean {
        return clientInfo.portfoliosCount > tariff.maxPortfoliosCount ||
            clientInfo.portfolios.some(portfolio => portfolio.sharesCount > tariff.maxSharesCount);
    }

    static getSubscribeDescription(clientInfo: Client, appendToSuffix: boolean = false): string {
        if (TariffUtils.isTariffExpired(clientInfo)) {
            return "Подписка истекла";
        } else {
            const paidTill = DateUtils.parseDate(clientInfo.paidTill);
            const currentDate = dayjs();
            const diff = paidTill.get("date") - currentDate.get("date");
            const isCurrentMonthAndYear = paidTill.get("month") === currentDate.get("month") && paidTill.get("year") === currentDate.get("year");
            if (paidTill.isAfter(currentDate) && (!isCurrentMonthAndYear || diff > 5)) {
                return `Подписка активна${appendToSuffix ? " до" : ""}`;
            } else if (isCurrentMonthAndYear && diff <= 5 && diff >= 0) {
                return "Подписка истекает";
            }
        }
        return "";
    }

    /**
     * Возвращает срок новой подписки
     * @param tariff тариф
     * @param clientInfo информация о клиенте
     */
    static getNewExpired(tariff: Tariff, clientInfo: ClientInfo): string {
        // если это upgrade тарифа
        // срок действия перерасчитывается
        if (tariff.compare(clientInfo.user.tariff) > 0) {
            // перассчитываем оставшиеся дни
            const oldDaysLeft = DateUtils.calculateDaysBetween(DateUtils.currentDate(), clientInfo.user.paidTill);
            const newMonthlyPrice = tariff.monthlyPrice;
            const oldMonthlyPrice = clientInfo.user.tariff.monthlyPrice;
            const newDaysLeft = oldMonthlyPrice.mul(new Decimal(oldDaysLeft)).div(newMonthlyPrice).toDP(0).toNumber();
            return DateUtils.addDaysToCurrent(newDaysLeft + 1);
        } else {
            // если это downgrade тарифа
            // тариф не перерасчитывается и просто остается таким же по сроку действия
            return DateUtils.formatDate(DateUtils.parseDate(clientInfo.user.paidTill));
        }
    }

    /**
     * Возвращает признак отображения диалога подтверждения при смене тарифа
     * Отображается только в случае если у пользователя платный, действующий тариф и переход осуществляется на платный тариф, и тарифы не совпадают
     * @param tariff тариф
     * @param clientInfo информация о клиенте
     * @param isSubscriptionExpired признак истекшей подписки
     */
    static needShowConfirm(tariff: Tariff, clientInfo: ClientInfo, isSubscriptionExpired: boolean): boolean {
        return [Tariff.PRO, Tariff.STANDARD].includes(clientInfo.user.tariff) && [Tariff.PRO, Tariff.STANDARD].includes(tariff) &&
            tariff !== clientInfo.user.tariff && !isSubscriptionExpired;
    }
}
