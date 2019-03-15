/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2018
 */
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {PortfolioService} from "../services/portfolioService";
import {TABLE_HEADERS, TableHeadersState, TABLES_NAME, TablesService} from "../services/tablesService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {Portfolio, StockPortfolioRow, TableHeader} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {BtnReturn} from "./dialogs/customDialog";
import {EditShareNoteDialog, EditShareNoteDialogData} from "./dialogs/editShareNoteDialog";
import {ShareTradesDialog} from "./dialogs/shareTradesDialog";
import {PortfolioRowFilter} from "./portfolioRowsTableFilter";
import {TableExtendedInfo} from "./tableExtendedInfo";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="filteredRows" item-key="stock.id"
                      :search="search" :custom-sort="customSort" :custom-filter="customFilter" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #items="props">
                <tr :class="['selectable', {'bold-row': !props.item.stock}]" @dblclick="props.expanded = !props.expanded">
                    <td>
                        <span v-if="props.item.stock" @click="props.expanded = !props.expanded"
                              :class="{'data-table-cell-open': props.expanded, 'path': true, 'data-table-cell': true}"></span>
                    </td>
                    <td v-if="tableHeadersState.company" class="text-xs-left">
                        <span v-if="props.item.stock">{{ props.item.stock.shortname }}</span>&nbsp;
                        <span v-if="props.item.stock"
                              :class="[(props.item.stock.change >= 0) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell']">{{ props.item.stock.change }}&nbsp;%</span>
                    </td>
                    <td v-if="tableHeadersState.ticker" class="text-xs-left">
                        <stock-link v-if="props.item.stock" :ticker="props.item.stock.ticker"></stock-link>
                    </td>
                    <td v-if="tableHeadersState.quantity" class="text-xs-right ii-number-cell">{{props.item.quantity}}</td>
                    <td v-if="tableHeadersState.avgBuy" class="text-xs-right ii-number-cell">{{ props.item.avgBuy | amount }}</td>
                    <td v-if="tableHeadersState.currPrice" class="text-xs-right ii-number-cell">{{ props.item.currPrice| amount(true) }}</td>
                    <td v-if="tableHeadersState.bcost" class="text-xs-right ii-number-cell">{{ props.item.bcost | amount }}</td>
                    <td v-if="tableHeadersState.scost" class="text-xs-right ii-number-cell">{{ props.item.scost | amount }}</td>
                    <td v-if="tableHeadersState.currCost" class="text-xs-right ii-number-cell">{{ props.item.currCost| amount(true) }}</td>
                    <td v-if="tableHeadersState.profitFromDividends" class="text-xs-right ii-number-cell">{{ props.item.profitFromDividends | amount }}</td>
                    <td v-if="tableHeadersState.profitFromDividendsPercent" class="text-xs-right ii-number-cell">{{ props.item.profitFromDividendsPercent }}</td>
                    <td v-if="tableHeadersState.rateProfit" class="text-xs-right ii-number-cell">{{ props.item.rateProfit | amount }}</td>
                    <td v-if="tableHeadersState.rateProfitPercent" class="text-xs-right ii-number-cell">{{ props.item.rateProfitPercent }}</td>
                    <td v-if="tableHeadersState.exchangeProfit" class="text-xs-right ii-number-cell">{{ props.item.exchangeProfit | amount }}</td>
                    <td v-if="tableHeadersState.exchangeProfitPercent" class="text-xs-right ii-number-cell">{{ props.item.exchangeProfitPercent }}</td>
                    <td v-if="tableHeadersState.profit" :class="[( amount(props.item.profit) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                        {{ props.item.profit| amount(true) }}
                    </td>
                    <td v-if="tableHeadersState.percProfit"
                        :class="[( Number(props.item.percProfit) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                        {{ props.item.percProfit | number }}
                    </td>
                    <td v-if="tableHeadersState.yearYield" class="text-xs-right ii-number-cell">{{ props.item.yearYield }}</td>
                    <td v-if="tableHeadersState.dailyPl" class="text-xs-right ii-number-cell">{{ props.item.dailyPl | amount }}</td>
                    <td v-if="tableHeadersState.dailyPlPercent" class="text-xs-right ii-number-cell">{{ props.item.dailyPlPercent }}</td>
                    <td v-if="tableHeadersState.summFee" class="text-xs-right ii-number-cell">{{ props.item.summFee | amount }}</td>
                    <td v-if="tableHeadersState.percCurrShare" class="text-xs-right ii-number-cell">{{ props.item.percCurrShare | number }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu v-if="props.item.stock" transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click="openShareTradesDialog(props.item.stock.ticker)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-list-alt</v-icon>
                                        Все сделки
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openEditShareNoteDialog(props.item.stock.ticker)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-sticky-note</v-icon>
                                        Заметка
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider></v-divider>
                                <v-list-tile @click="openTradeDialog(props.item, operation.BUY)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                        Купить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openTradeDialog(props.item, operation.SELL)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-minus</v-icon>
                                        Продать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openTradeDialog(props.item, operation.DIVIDEND)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Дивиденд
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider></v-divider>
                                <v-list-tile @click="deleteAllTrades(props.item)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-trash-alt</v-icon>
                                        Удалить
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>

            <template #expand="props">
                <table-extended-info :headers="headers" :table-name="TABLES_NAME.STOCK"
                                     :asset="AssetType.STOCK" :row-item="props.item" :ticker="props.item.stock.ticker">
                    <div class="extended-info__cell label">Время нахождения в портфеле</div>
                    <div class="extended-info__cell">
                        {{ props.item.ownedDays }} {{ props.item.ownedDays | declension("день", "дня", "дней")}}, c {{ props.item.firstBuy | date }}
                    </div>

                    <div class="extended-info__cell label">Количество полных лотов</div>
                    <div class="extended-info__cell">{{ props.item.lotCounts }}</div>
                </table-extended-info>
            </template>
        </v-data-table>
    `,
    components: {TableExtendedInfo}
})
export class StockTable extends UI {

    @Inject
    private tradeService: TradeService;
    @Inject
    private tablesService: TablesService;
    @Inject
    private portfolioService: PortfolioService;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    /** Список заголовков таблицы */
    @Prop()
    private headers: TableHeader[];
    /** Список отображаемых строк */
    @Prop({default: [], required: true})
    private rows: StockPortfolioRow[];
    /** Поисковая строка */
    @Prop({required: false, type: String, default: ""})
    private search: string;
    /** Фильтр строк */
    @Prop({
        required: false, type: Object, default: (): PortfolioRowFilter => {
            return {};
        }
    })
    private filter: PortfolioRowFilter;
    /** Список отображаемых строк */
    private filteredRows: StockPortfolioRow[] = [];
    /** Состояние столбцов таблицы */
    private tableHeadersState: TableHeadersState;
    /** Текущая операция */
    private operation = Operation;
    /** Перечисление типов таблиц */
    private TABLES_NAME = TABLES_NAME;
    /** Типы активов */
    private AssetType = AssetType;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    created(): void {
        /** Установка состояния заголовков таблицы */
        this.setHeadersState();
        this.setFilteredRows();
    }

    @Watch("headers")
    onHeadersChange(): void {
        this.setHeadersState();
    }

    @Watch("rows")
    onRowsChange(): void {
        this.setFilteredRows();
    }

    @Watch("filter", {deep: true})
    async onFilterChange(): Promise<void> {
        this.setFilteredRows();
    }

    setFilteredRows(): void {
        if (this.filter.hideSoldRows) {
            this.filteredRows = [...this.rows.filter(row => row.quantity !== 0)];
        } else {
            this.filteredRows = [...this.rows];
        }
    }

    setHeadersState(): void {
        this.tableHeadersState = this.tablesService.getHeadersState(this.headers);
    }

    @ShowProgress
    private async openShareTradesDialog(ticker: string): Promise<void> {
        new ShareTradesDialog().show({trades: await this.tradeService.getShareTrades(this.portfolio.id, ticker), ticker});
    }

    /**
     * Обновляет заметки по бумага в портфеле
     * @param ticker тикер по которому редактируется заметка
     */
    private async openEditShareNoteDialog(ticker: string): Promise<void> {
        const data = await new EditShareNoteDialog().show({ticker, note: this.portfolio.portfolioParams.shareNotes[ticker]});
        if (data) {
            await this.editShareNote(data);
        }
    }

    @ShowProgress
    private async editShareNote(data: EditShareNoteDialogData): Promise<void> {
        await this.portfolioService.updateShareNotes(this.portfolio, data);
        this.$snotify.info(`Заметка по бумаге ${data.ticker} была успешно сохранена`);
    }

    private async openTradeDialog(stockRow: StockPortfolioRow, operation: Operation): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: stockRow.stock,
            quantity: operation === Operation.DIVIDEND ? stockRow.quantity : null,
            operation,
            assetType: AssetType.STOCK
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async deleteAllTrades(stockRow: StockPortfolioRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            await this.deleteAllTradesAndReloadData(stockRow);
        }
    }

    @ShowProgress
    private async deleteAllTradesAndReloadData(stockRow: StockPortfolioRow): Promise<void> {
        await this.tradeService.deleteAllTrades({
            assetType: AssetType.STOCK.enumName,
            ticker: stockRow.stock.ticker,
            portfolioId: this.portfolio.id
        });
        await this.reloadPortfolio(this.portfolio.id);
    }

    private amount(value: string): number {
        if (!value) {
            return 0.00;
        }
        const amount = new BigMoney(value);
        return amount.amount.toNumber();
    }

    private customSort(items: StockPortfolioRow[], index: string, isDesc: boolean): StockPortfolioRow[] {
        items.sort((a: StockPortfolioRow, b: StockPortfolioRow): number => {
            if (!CommonUtils.exists(a.stock)) {
                return 1;
            }
            if (!CommonUtils.exists(b.stock)) {
                return -1;
            }
            if (index === TABLE_HEADERS.TICKER) {
                if (!isDesc) {
                    return a.stock.ticker.localeCompare(b.stock.ticker);
                } else {
                    return b.stock.ticker.localeCompare(a.stock.ticker);
                }
            } else if (index === TABLE_HEADERS.COMPANY) {
                if (!isDesc) {
                    return a.stock.shortname.localeCompare(b.stock.shortname);
                } else {
                    return b.stock.shortname.localeCompare(a.stock.shortname);
                }
            } else {
                const first = (a as any)[index];
                const second = (b as any)[index];
                if (!isDesc) {
                    return TradeUtils.compareValues(first, second) * -1;
                } else {
                    return TradeUtils.compareValues(first, second);
                }
            }
        });
        return items;
    }

    private customFilter(items: StockPortfolioRow[], search: string): StockPortfolioRow[] {
        if (CommonUtils.isBlank(search)) {
            return items;
        }
        search = search.toLowerCase();
        return items.filter(row => {
            return row.stock && (row.stock.shortname.toLowerCase().includes(search) ||
                row.stock.ticker.toLowerCase().includes(search) ||
                row.stock.price.includes(search) ||
                row.yearYield.includes(search));
        });
    }
}