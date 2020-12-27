/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

/**
 * Компонент для настройки отображения столбцов таблицы
 */
import {Inject} from "typescript-ioc";
import {Component, Prop, UI} from "../app/ui";
import {Storage} from "../platform/services/storage";
import {TableHeaders, TablesService, TableType} from "../services/tablesService";
import {EventType} from "../types/eventType";
import {TableHeader} from "../types/types";

@Component({
    // language=Vue
    template: `
        <div class="table-settings-menu">
            <div class="table-settings-menu__header">
                <div>Настройте колонки для отображения</div>
                <a @click="setDefaults">По умолчанию</a>
            </div>
            <div class="table-settings-menu__wrapper">
                <template v-for="header in headers">
                    <v-switch v-if="!header.ghost" :label="header.text" v-model="header.active" @change="filterHeaders"></v-switch>
                </template>
            </div>
        </div>
    `
})
export class TableSettingsMenu extends UI {
    @Inject
    private tablesService: TablesService;
    @Inject
    private localStorage: Storage;
    @Prop({required: true, type: String})
    private tableType: TableType;
    /** Список заголовков таблиц */
    private headers: TableHeader[] = [];

    mounted(): void {
        this.headers = this.tablesService.headers[this.tableType];
    }

    private filterHeaders(): void {
        this.tablesService.setHeaders(this.tableType, this.headers);
        UI.emit(EventType.FILTER_HEADERS, this.tableType);
    }

    /** Устанавливает заголовки по умолчанию */
    private setDefaults(): void {
        const headers = this.localStorage.get<TableHeaders>("tableHeadersParams", null);
        if (!headers) {
            this.tablesService.setHeaders(this.tableType, this.tablesService.HEADERS[this.tableType]);
            return;
        }
        this.headers = [...this.tablesService.HEADERS[this.tableType].map(el => ({...el}))];
        this.filterHeaders();
    }
}
