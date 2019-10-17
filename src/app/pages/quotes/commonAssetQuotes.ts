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
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {EmptySearchResult} from "../../components/emptySearchResult";
import {QuotesFilterTable} from "../../components/quotesFilterTable";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {AssetModel, AssetService} from "../../services/assetService";
import {QuotesFilter} from "../../services/marketService";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {Portfolio, TableHeader} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid class="pa-0" data-v-step="0">
            <quotes-filter-table :filter="filter" @input="tableSearch" :min-length="1" placeholder="Поиск"></quotes-filter-table>

            <empty-search-result v-if="filteredAssets.length === 0" @resetFilter="resetFilter"></empty-search-result>

            <v-data-table v-else :headers="headers" :items="filteredAssets" item-key="id" class="data-table quotes-table" must-sort hide-actions>
                <template #items="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <asset-link :ticker="String(props.item.id)">{{ props.item.ticker }}</asset-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.name }}</td>
                        <td class="text-xs-left">{{ props.item.category.description }}</td>
                        <td class="text-xs-center ii-number-cell">{{ props.item.price | amount(false, null, false, false) }}</td>
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
    components: {QuotesFilterTable, EmptySearchResult}
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

    /** Фильтр котировок */
    private filter: QuotesFilter = {
        searchQuery: "",
        showUserShares: false
    };

    private assets: AssetModel[] = [];

    private filteredAssets: AssetModel[] = [];

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "80"},
        {text: "Компания", align: "left", value: "name", width: "200"},
        {text: "Тип", align: "left", value: "assetType", width: "50"},
        {text: "Цена", align: "center", value: "price", width: "50"},
        {text: "Валюта", align: "center", value: "currency", width: "50"},
        {text: "", value: "", align: "center", sortable: false, width: "50"}
    ];

    @ShowProgress
    async created(): Promise<void> {
        this.assets = await this.assetService.getCommonAssets();
        this.filteredAssets = [...this.assets];
    }

    private async resetFilter(): Promise<void> {
        this.filter.searchQuery = "";
        this.filteredAssets = [...this.assets];
    }

    private async tableSearch(search: string): Promise<void> {
        this.filter.searchQuery = search;
        const searchString = search.toLowerCase();
        this.filteredAssets = this.assets.filter(asset => {
            return asset.name.toLowerCase().includes(searchString) ||
                asset.ticker.toLowerCase().includes(searchString);
        });
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
}
