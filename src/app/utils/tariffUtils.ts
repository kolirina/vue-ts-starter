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
import {ClientInfo} from "../services/clientService";
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
}
