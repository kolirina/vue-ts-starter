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
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../../app/ui";
import {AdditionalPagination} from "../../components/additionalPagination";
import {CommonAssetQuotesFilter} from "../../components/commonAssetQuotesFilter";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {EmptySearchResult} from "../../components/emptySearchResult";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {AssetCategory, AssetModel, AssetService} from "../../services/assetService";
import {FiltersService} from "../../services/filtersService";
import {AssetQuotesFilter} from "../../services/marketService";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {StoreKeys} from "../../types/storeKeys";
import {Pagination, Portfolio, TableHeader} from "../../types/types";
import {TradeUtils} from "../../utils/tradeUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid class="pa-0" data-v-step="0">
            <div class="additional-pagination-quotes-table">
                <additional-pagination :pagination="pagination" @update:pagination="onTablePaginationChange"></additional-pagination>
            </div>
            <common-asset-quotes-filter :filter="filter" @input="tableSearch" @filter="onFilterChange" :min-length="1" placeholder="Поиск"
                                        :store-key="StoreKeys.COMMON_QUOTES_FILTER_KEY"></common-asset-quotes-filter>

            <empty-search-result v-if="isEmptySearchResult" @resetFilter="resetFilter"></empty-search-result>

            <v-data-table v-else :headers="headers" :items="assets" item-key="id" :pagination="pagination" @update:pagination="onTablePaginationChange"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="pagination.totalItems" class="data-table quotes-table normalize-table table-bottom-pagination" must-sort>
                <template #items="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <asset-link :ticker="String(props.item.id)">{{ props.item.ticker }}</asset-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.name }}</td>
                        <td class="text-xs-left">{{ props.item.category.description }}</td>
                        <td class="text-xs-center ii-number-cell">
                            {{ props.item.price | amount(false, null, false) }} <span class="second-value">{{ currencyForPrice(props.item) }}</span>
                        </td>
                        <td :class="[( Number(props.item.change) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-center']">
                            {{ props.item.change }}&nbsp;%
                        </td>
                        <td class="text-xs-center">{{ props.item.currency }}</td>
                        <td class="justify-end layout px-0" @click.stop>
                            <v-menu transition="slide-y-transition" bottom left nudge-bottom="25">
                                <v-btn slot="activator" flat icon dark>
                                    <span class="menuDots"></span>
                                </v-btn>
                                <v-list dense>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.BUY)">
                                        <v-list-tile-title>
                                            Купить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.SELL)">
                                        <v-list-tile-title>
                                            Продать
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.DIVIDEND)">
                                        <v-list-tile-title>
                                            Дивиденд
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-container>
    `,
    components: {AdditionalPagination, CommonAssetQuotesFilter, EmptySearchResult}
})
export class CommonAssetQuotes extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Текущая операция */
    private operation = Operation;
    @Inject
    private assetService: AssetService;
    @Inject
    private filtersService: FiltersService;

    /** Фильтр котировок */
    private filter: AssetQuotesFilter = this.filtersService.getAssetFilter(StoreKeys.COMMON_QUOTES_FILTER_KEY, {
        searchQuery: "",
        categories: [...AssetCategory.values()],
        currency: null,
    });

    private assets: AssetModel[] = [];

    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "120"},
        {text: "Компания", align: "left", value: "name"},
        {text: "Тип", align: "left", value: "assetType", width: "200"},
        {text: "Цена", align: "center", value: "price", width: "200"},
        {text: "Изменение", align: "center", value: "change", width: "160"},
        {text: "Валюта", align: "center", value: "currency", width: "100"},
        {text: "", value: "", align: "center", sortable: false, width: "50"}
    ];
    /** Объект паджинации */
    private pagination: Pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        sortBy: "ticker",
        totalItems: 0,
        pages: 0
    };
    /** Признак что ничего не найдено */
    private isEmptySearchResult: boolean = false;

    private async resetFilter(): Promise<void> {
        this.filter.searchQuery = "";
        this.filter.categories = [...AssetCategory.values()];
        this.filter.currency = null;
        await this.loadAssets();
    }

    private async tableSearch(search: string): Promise<void> {
        this.filter.searchQuery = search;
        await this.loadAssets();
    }

    /**
     * Обрыбатывает событие изменения паджинации и загружает данные
     * @param pagination
     */
    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadAssets();
    }

    /**
     * Обрабатывает изменение фильтра
     */
    private async onFilterChange(): Promise<void> {
        await this.loadAssets();
    }

    @ShowProgress
    private async loadAssets(): Promise<void> {
        const response = await this.assetService.getCommonAssets(this.pagination, this.filter);
        this.assets = response.content;
        this.pagination.totalItems = response.totalItems;
        this.pagination.pages = response.pages;
        this.isEmptySearchResult = this.assets.length === 0;
    }

    private async openTradeDialog(asset: AssetModel, operation: Operation): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            shareId: String(asset.id),
            operation,
            assetType: AssetType.ASSET
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private currencyForPrice(asset: AssetModel): string {
        return TradeUtils.currencySymbolByAmount(asset.price).toLowerCase();
    }
}
