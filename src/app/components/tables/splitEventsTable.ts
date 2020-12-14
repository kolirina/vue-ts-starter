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
import {namespace} from "vuex-class";
import {Component, Prop, UI} from "../../app/ui";
import {Storage} from "../../platform/services/storage";
import {SplitEvent} from "../../services/eventService";
import {Pagination, Portfolio, TableHeader} from "../../types/types";
import {SortUtils} from "../../utils/sortUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table v-if="events.length" :headers="headers" :items="events" item-key="id" :custom-sort="customSortEvents"
                      class="data-table events-table" :pagination.sync="eventsPagination" hide-actions must-sort>
            <template #items="props">
                <tr class="selectable">
                    <td class="text-xs-left pl-30">
                        <stock-link :ticker="props.item.share.ticker">{{ props.item.share.ticker }}</stock-link>
                    </td>
                    <td class="text-xs-left">
                        <stock-link :ticker="props.item.share.ticker">{{ props.item.share.shortname }}</stock-link>
                    </td>
                    <td class="text-xs-left">
                        {{ props.item.date | date }}
                    </td>
                    <td class="text-xs-center">
                        {{ props.item.type }}
                    </td>
                    <td class="text-xs-center">
                        {{ props.item.to | quantity }} {{ props.item.to | declension("бумага", "бумаги", "бумаг") }} из
                        {{ props.item.from | quantity }} {{ props.item.from | declension("бумаги", "бумаг", "бумаг") }}
                    </td>
                    <td v-if="allowActions" class="justify-end layout pr-3" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click="$emit('execute', props.item)">
                                    <v-list-tile-title>
                                        Исполнить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="$emit('reject', props.item)">
                                    <v-list-tile-title class="delete-btn">
                                        Удалить
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class SplitEventsTable extends UI {

    private static readonly ACTION_HEADER = {text: "", value: "actions", align: "center", width: "25", sortable: false};

    @Inject
    private localStorage: Storage;

    @MainStore.Getter
    private portfolio: Portfolio;
    @Prop({default: [], required: true})
    private events: SplitEvent[];

    /** Заголовки таблицы Новости по облигациям */
    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "60"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Дата", align: "center", value: "date", sortable: true, width: "70"},
        {text: "Событие", align: "right", value: "type", width: "100"},
        {text: "Соотношение", align: "right", value: "amountPerShare", width: "250"},
    ];

    /** Паджинация для задания дефолтной сортировки */
    private eventsPagination: Pagination = this.localStorage.get("splitPagination", {
        descending: false,
        sortBy: "date",
        rowsPerPage: -1
    });

    async created(): Promise<void> {
        if (this.allowActions) {
            this.headers.push(SplitEventsTable.ACTION_HEADER);
        }
    }

    private customSortEvents(items: SplitEvent[], index: string, isDesc: boolean): SplitEvent[] {
        return SortUtils.customSortSplitEvents(items, index, isDesc);
    }

    private get allowActions(): boolean {
        return !this.portfolio.portfolioParams.combinedFlag;
    }
}
