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

import {Inject} from "typescript-ioc";
import * as versionConfig from "../../version.json";
import {Storage} from "../platform/services/storage";
import {StoreKeys} from "../types/storeKeys";
import {CombinedPortfolioParams} from "../types/types";
import {DateUtils} from "../utils/dateUtils";
import {TablesService} from "./tablesService";

export class LocalStorageUpdater {

    /** Экземпляр класса */
    private static instance: LocalStorageUpdater = new LocalStorageUpdater();

    @Inject
    private localStorage: Storage;
    @Inject
    private tableService: TablesService;

    /**
     * Возвращает экземпляр класса
     */
    static getInstance(): LocalStorageUpdater {
        return LocalStorageUpdater.instance;
    }

    /**
     * Централизованно изменяет данные в localStorage, которые потеряли свою актуальность из-за новых версий приложения
     */
    updateLocalStorage(): void {
        if (versionConfig.date !== this.localStorage.get<string>(StoreKeys.LOCAL_STORAGE_LAST_UPDATE_DATE_KEY, null)) {
            // this.updateTableColumns();
            this.updateCombinedPortfolioParams();
            this.localStorage.set<string>(StoreKeys.LOCAL_STORAGE_LAST_UPDATE_DATE_KEY, versionConfig.date);
        }
    }

    private updateCombinedPortfolioParams(): void {
        const viewCurrency = this.localStorage.get(StoreKeys.COMBINED_VIEW_CURRENCY_KEY, null);
        const params = this.localStorage.get(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, null);
        if (viewCurrency && !params) {
            this.localStorage.set(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {viewCurrency} as CombinedPortfolioParams);
            this.localStorage.delete(StoreKeys.COMBINED_VIEW_CURRENCY_KEY);
        }
    }

    /**
     * Обновляет настройки колонок таблиц
     */
    private updateTableColumns(): void {
        const needUpdate = this.needUpdate();
        if (needUpdate) {
            this.localStorage.delete("tableHeadersParams");
        }
    }

    /**
     * Возвращает признак необходимости обновления данных.
     * Если дата в localStorage не совпадает с датой версии
     */
    private needUpdate(): boolean {
        const currentDate = DateUtils.currentDate();
        const lastUpdateDate = DateUtils.parseDate(this.localStorage.get<string>(StoreKeys.LOCAL_STORAGE_LAST_UPDATE_DATE_KEY, currentDate));
        return !DateUtils.parseDate(versionConfig.date).isSame(lastUpdateDate, "day");
    }
}
