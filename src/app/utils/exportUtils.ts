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

import {ClientInfo} from "../services/clientService";
import {Tariff} from "../types/tariff";
import {TariffUtils} from "./tariffUtils";

export class ExportUtils {

    private constructor() {
    }

    /**
     * Возвращает признак доступности для загрузки файла со сделками
     */
    static isDownloadNotAllowed(clientInfo: ClientInfo): boolean {
        const userTariff = clientInfo.user.tariff;
        return userTariff === Tariff.TRIAL || TariffUtils.isTariffExpired(clientInfo.user);
    }
}
