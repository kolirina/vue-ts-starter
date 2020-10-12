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
import {Client, ClientInfo} from "../services/clientService";
import {SystemPropertyName} from "../services/systemPropertiesService";
import {Permission} from "../types/permission";
import {Tariff} from "../types/tariff";
import {MapType} from "../types/types";
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

    static limitsExceeded(clientInfo: ClientInfo, systemProperties: MapType): boolean {
        const tariff = clientInfo.user.tariff;
        const isNewTariffsApplicable = DateUtils.parseDate(clientInfo.user.regDate).isAfter(DateUtils.parseDate(systemProperties[SystemPropertyName.NEW_TARIFFS_DATE_FROM]));
        // если действуют новые тарифы, то проверяем на всех тарифах превышение лимитов, без учета превышения по зарубежным бумагам
        if (isNewTariffsApplicable) {
            return clientInfo.user.portfoliosCount > tariff.maxPortfoliosCount ||
                clientInfo.user.portfolios.some(portfolio => portfolio.sharesCount > tariff.maxSharesCountNew);
        } else {
            return tariff === Tariff.FREE && (clientInfo.user.portfoliosCount > tariff.maxPortfoliosCount ||
                clientInfo.user.portfolios.some(portfolio => portfolio.sharesCount > tariff.maxSharesCount) ||
                (clientInfo.user.foreignShares && !tariff.hasPermission(Permission.FOREIGN_SHARES)));
        }
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
}
