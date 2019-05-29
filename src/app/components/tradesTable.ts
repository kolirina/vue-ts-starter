import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {ClientService} from "../services/clientService";
import {TableHeadersState, TABLES_NAME, TablesService} from "../services/tablesService";
import {TradeFields} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {Pagination, Portfolio, TableHeader, TablePagination, TradeRow} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {DateFormat} from "../utils/dateUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";
import {TradesTableExtInfo} from "./tradesTableExtInfo";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table table-bottom-pagination" :headers="headers" :items="trades" item-key="id" :pagination="tradePagination.pagination"
                      @update:pagination="onTablePaginationChange"
                      :total-items="tradePagination.pagination.totalItems" :custom-sort="customSort"
                      :no-data-text="portfolio.overview.totalTradesCount ? 'Ничего не найдено' : 'Добавьте свою первую сделку и она отобразится здесь'"
                      :rows-per-page-items="[25, 50, 100, 200]"
                      expand must-sort>
            <template #items="props">
                <tr class="selectable" @dblclick="props.expanded = !props.expanded">
                    <td>
                        <span @click="props.expanded = !props.expanded" class="data-table-cell" :class="{'data-table-cell-open': props.expanded, 'path': true}"></span>
                    </td>
                    <td v-if="tableHeadersState.ticker" class="text-xs-left">
                        <stock-link v-if="props.item.asset === 'STOCK'" :ticker="props.item.ticker"></stock-link>
                        <bond-link v-if="props.item.asset === 'BOND'" :ticker="props.item.ticker"></bond-link>
                        <span v-if="props.item.asset === 'MONEY'">{{ props.item.ticker }}</span>
                    </td>
                    <td v-if="tableHeadersState.name" class="text-xs-left">{{ props.item.companyName }}</td>
                    <td v-if="tableHeadersState.operationLabel" class="text-xs-left">{{ props.item.operationLabel }}</td>
                    <td v-if="tableHeadersState.date" class="text-xs-center">{{ getTradeDate(props.item) }}</td>
                    <td v-if="tableHeadersState.quantity" class="text-xs-right ii-number-cell">{{ props.item.quantity }}</td>
                    <td v-if="tableHeadersState.price" :class="['text-xs-right', 'ii-number-cell']">
                        {{ getPrice(props.item) }}&nbsp;<span class="second-value">{{ currencyForPrice(props.item) }}</span>
                    </td>
                    <td v-if="tableHeadersState.facevalue" :class="['text-xs-right', 'ii-number-cell']">
                        {{ props.item.facevalue | amount(false, null, false) }}&nbsp;<span class="second-value">{{ props.item.facevalue | currencySymbol }}</span>
                    </td>
                    <td v-if="tableHeadersState.nkd" :class="['text-xs-right', 'ii-number-cell']">
                        {{ props.item.nkd | amount(false, null, false) }}&nbsp;<span class="second-value">{{ props.item.nkd | currencySymbol }}</span>
                    </td>
                    <td v-if="tableHeadersState.fee" :class="['text-xs-right', 'ii-number-cell']">
                        {{ getFee(props.item) }}&nbsp;<span class="second-value">{{ props.item.fee | currencySymbol }}</span>
                    </td>
                    <td v-if="tableHeadersState.signedTotal" :class="['text-xs-right', 'ii-number-cell']">
                        {{ props.item.signedTotal | amount(true) }}&nbsp;<span class="second-value">{{ props.item.signedTotal | currencySymbol }}</span>
                    </td>
                    <td v-if="tableHeadersState.totalWithoutFee" :class="['text-xs-right', 'ii-number-cell']">
                        {{ props.item.totalWithoutFee | amount }}&nbsp;<span class="second-value">{{ props.item.totalWithoutFee | currencySymbol }}</span>
                    </td>
                    <td class="px-0" style="text-align: center" @click.stop>
                        <v-layout align-center justify-center v-if="props.item.parentTradeId">
                            <v-tooltip transition="slide-y-transition"
                                       content-class="menu-icons" bottom
                                       class="hint-for-icon-name-section"
                                       :max-width="300">
                                <img src="img/trades/related_deal.svg" slot="activator">
                                <div class="pa-3">
                                    Это связанная сделка, отредактируйте основную сделку для изменения.
                                </div>
                            </v-tooltip>
                        </v-layout>
                    </td>
                    <td class="px-0" @click.stop>
                        <v-layout align-center justify-center>
                            <v-menu transition="slide-y-transition" bottom left>
                                <v-btn slot="activator" flat icon dark>
                                    <span class="menuDots"></span>
                                </v-btn>
                                <v-list dense>
                                    <v-list-tile v-if="!props.item.parentTradeId" @click.stop="openEditTradeDialog(props.item)">
                                        <v-list-tile-title>
                                            Редактировать
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-divider v-if="!props.item.parentTradeId"></v-divider>
                                    <v-list-tile v-if="!isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.BUY)">
                                        <v-list-tile-title>
                                            Купить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="!isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.SELL)">
                                        <v-list-tile-title>
                                            Продать
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.DEPOSIT)">
                                        <v-list-tile-title>
                                            Внести
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.WITHDRAW)">
                                        <v-list-tile-title>
                                            Вывести
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.INCOME)">
                                        <v-list-tile-title>
                                            Доход
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.LOSS)">
                                        <v-list-tile-title>
                                            Расход
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isStockTrade(props.item)" @click="openTradeDialog(props.item, operation.DIVIDEND)">
                                        <v-list-tile-title>
                                            Дивиденд
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isBondTrade(props.item)" @click="openTradeDialog(props.item, operation.COUPON)">
                                        <v-list-tile-title>
                                            Купон
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isBondTrade(props.item)" @click="openTradeDialog(props.item, operation.AMORTIZATION)">
                                        <v-list-tile-title>
                                            Амортизация
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile v-if="isBondTrade(props.item)" @click="openTradeDialog(props.item, operation.REPAYMENT)">
                                        <v-list-tile-title>
                                            Погашение
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <!-- Связанную сделку удалить можно только удалив родительскую -->
                                    <v-divider v-if="!props.item.parentTradeId"></v-divider>
                                    <v-list-tile v-if="!props.item.parentTradeId" @click="deleteTrade(props.item)">
                                        <v-list-tile-title>
                                            Удалить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </v-layout>
                    </td>
                </tr>
            </template>

            <template #expand="props">
                <trades-table-ext-info :trade-row="props.item" :portfolio-pro-mode="portfolioProModeEnabled"></trades-table-ext-info>
            </template>
        </v-data-table>
    `,
    components: {TradesTableExtInfo}
})
export class TradesTable extends UI {

    @Inject
    private tablesService: TablesService;
    @Inject
    private clientService: ClientService;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Список заголовков таблицы */
    @Prop()
    private headers: TableHeader[];
    /** Список отображаемых строк */
    @Prop({default: [], required: true})
    private trades: TradeRow[];
    /** Паджинация таблицы */
    @Prop({required: true, type: Object})
    private tradePagination: TablePagination;
    /** Состояние столбцов таблицы */
    private tableHeadersState: TableHeadersState;
    /** Текущая операция */
    private operation = Operation;
    /** Перечисление типов таблиц */
    private TABLES_NAME = TABLES_NAME;
    /** Типы активов */
    private AssetType = AssetType;
    /** Признак доступности профессионального режима */
    private portfolioProModeEnabled = false;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        /** Установка состояния заголовков таблицы */
        this.setHeadersState();
        const clientInfo = await this.clientService.getClientInfo();
        this.portfolioProModeEnabled = TradeUtils.isPortfolioProModeEnabled(this.portfolio, clientInfo);
    }

    setHeadersState(): void {
        this.tableHeadersState = this.tablesService.getHeadersState(this.headers);
    }

    @Watch("headers")
    onHeadersChange(): void {
        this.setHeadersState();
    }

    @Watch("trades")
    onTradesUpdate(trades: TradeRow[]): void {
        this.trades = trades;
    }

    private async resetFilter(): Promise<void> {
        this.$emit("resetFilter");
    }

    private onTablePaginationChange(pagination: Pagination): void {
        this.$emit("update:pagination", pagination);
    }

    private async openTradeDialog(trade: TradeRow, operation: Operation): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: null,
            ticker: trade.ticker,
            operation,
            assetType: AssetType.valueByName(trade.asset)
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async openEditTradeDialog(trade: TradeRow): Promise<void> {
        const tradeFields: TradeFields = {
            ticker: trade.ticker,
            date: trade.date,
            quantity: trade.quantity,
            price: this.moneyPrice(trade) ? TradeUtils.decimal(trade.moneyPrice) : this.percentPrice(trade) ? trade.bondPrice : null,
            facevalue: trade.facevalue,
            nkd: trade.nkd,
            perOne: null,
            fee: BigMoney.isEmptyOrZero(trade.fee) ? null : trade.fee,
            note: trade.note,
            keepMoney: CommonUtils.exists(trade.moneyTradeId),
            moneyAmount: trade.signedTotal,
            currency: trade.currency
        };
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            assetType: AssetType.valueByName(trade.asset),
            operation: Operation.valueByName(trade.operation),
            tradeFields: tradeFields,
            tradeId: trade.id,
            editedMoneyTradeId: trade.moneyTradeId
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async deleteTrade(tradeRow: TradeRow): Promise<void> {
        this.$emit("delete", tradeRow);
    }

    private getTradeDate(trade: TradeRow): string {
        const date = TradeUtils.getDateString(trade.date);
        const time = TradeUtils.getTimeString(trade.date);
        return this.portfolioProModeEnabled && !!time ? Filters.formatDate(`${date} ${time}`, DateFormat.DATE_TIME) : Filters.formatDate(date, DateFormat.DATE);
    }

    private getPrice(trade: TradeRow): string {
        return TradeUtils.getPrice(trade);
    }

    private getFee(trade: TradeRow): string {
        return TradeUtils.getFee(trade);
    }

    private percentPrice(trade: TradeRow): boolean {
        return TradeUtils.percentPrice(trade);
    }

    private moneyPrice(trade: TradeRow): boolean {
        return TradeUtils.moneyPrice(trade);
    }

    private isBondTrade(trade: TradeRow): boolean {
        return AssetType.valueByName(trade.asset) === AssetType.BOND;
    }

    private isStockTrade(trade: TradeRow): boolean {
        return AssetType.valueByName(trade.asset) === AssetType.STOCK;
    }

    private isMoneyTrade(trade: TradeRow): boolean {
        return AssetType.valueByName(trade.asset) === AssetType.MONEY;
    }

    private currencyForPrice(trade: TradeRow): string {
        return this.moneyPrice(trade) ? TradeUtils.currencySymbolByAmount(trade.moneyPrice).toLowerCase() : this.percentPrice(trade) ? "%" : "";
    }

    private currency(amount: string): string {
        const currencyCode = TradeUtils.currencySymbolByAmount(amount);
        return currencyCode ? currencyCode.toLowerCase() : "";
    }

    private customSort(items: TradeRow[], index: string, isDesc: boolean): TradeRow[] {
        return items;
    }
}
