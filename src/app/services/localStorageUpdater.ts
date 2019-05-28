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
import {DateUtils} from "../utils/dateUtils";
import {TableHeaders, TablesService} from "./tablesService";

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
     * Централизованно изменяет данные в localStorage, которые потеряли свою актуальность изза новых версий приложения
     */
    updateLocalStorage(): void {
        this.updateCalendarEventTypes();
        this.updateTableColumns();
    }

    /**
     * Обновляет типы событий календаря
     */
    private updateCalendarEventTypes(): void {
        const eventsFromStorage = this.localStorage.get<string[]>("calendarEvents", null);
        // обновляем старое значение CUSTOM на новое USER
        if (eventsFromStorage && eventsFromStorage.includes("custom")) {
            eventsFromStorage.splice(eventsFromStorage.indexOf("custom"), 1);
            this.localStorage.set<string[]>("calendarEvents", eventsFromStorage);
        }
    }

    /**
     * Обновляет настройки колонок таблиц
     */
    private updateTableColumns(): void {
        const needUpdate = this.needUpdate();
        const headersFromStorage = this.localStorage.get<TableHeaders>("tableHeadersParams", null);
        if (needUpdate) {
            this.localStorage.set<TableHeaders>("tableHeadersParams", {...this.tableService.HEADERS});
            this.localStorage.set<string>(StoreKeys.LOCAL_STORAGE_LAST_UPDATE_DATE_KEY, versionConfig.date);
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
