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
import {TableHeaders, TablesService} from "../services/tablesService";
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
    private tableName: string;
    /** Список заголовков таблиц */
    private headers: TableHeader[] = [];

    mounted(): void {
        this.headers = this.tablesService.headers[this.tableName].map(el => ({...el}));
    }

    private filterHeaders(): void {
        this.tablesService.setHeaders(this.tableName, this.headers);
        this.$emit("filterHeaders");
    }

    /** Устанавливает заголовки по умолчанию */
    private setDefaults(): void {
        const tables = this.localStorage.get<TableHeaders>("tableHeadersParams", null);
        tables[this.tableName] = this.tablesService.HEADERS[this.tableName];
        this.headers = tables[this.tableName];
        this.localStorage.set("tableHeadersParams", tables);
        this.filterHeaders();
    }
}