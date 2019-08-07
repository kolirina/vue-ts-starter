import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {PortfolioService} from "../services/portfolioService";
import {TableHeadersState, TABLES_NAME, TablesService} from "../services/tablesService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {BondPortfolioRow, Pagination, TableHeader} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {SortUtils} from "../utils/sortUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {EditShareNoteDialog, EditShareNoteDialogData} from "./dialogs/editShareNoteDialog";
import {ShareTradesDialog} from "./dialogs/shareTradesDialog";
import {PortfolioRowFilter} from "./portfolioRowsTableFilter";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="filteredRows" item-key="bond.id"
                      :search="search" :custom-sort="customSort" :custom-filter="customFilter" :pagination.sync="pagination" expand hide-actions must-sort>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #headerCell="props">
                <v-tooltip v-if="props.header.tooltip" content-class="custom-tooltip-wrap" bottom>
                    <template #activator="{ on }">
                        <span class="data-table__header-with-tooltip" v-on="on">
                            {{ getHeaderText(props.header) }}
                        </span>
                    </template>
                    <span>
                      {{ props.header.tooltip }}
                    </span>
                </v-tooltip>
                <span v-else>
                    {{ getHeaderText(props.header) }}
                </span>
            </template>
            <template #items="props">
                <tr :class="['selectable', {'bold-row': !props.item.bond}]" @dblclick="expandRow(props)">
                    <td>
                        <span v-if="props.item.bond" @click="props.expanded = !props.expanded"
                              :class="{'data-table-cell-open': props.expanded, 'path': true, 'data-table-cell': true}"></span>
                    </td>
                    <td v-if="tableHeadersState.company" class="text-xs-left">
                        <span v-if="props.item.bond" :class="props.item.quantity !== 0 ? '' : 'line-through'">{{ props.item.bond.shortname }}</span>&nbsp;
                        <span v-if="props.item.bond && props.item.quantity !== 0"
                              :class="markupClasses(Number(props.item.bond.change))">{{ props.item.bond.change }}&nbsp;%</span>
                    </td>
                    <td v-if="tableHeadersState.ticker" class="text-xs-left">
                        <bond-link v-if="props.item.bond" :ticker="props.item.bond.ticker"></bond-link>
                    </td>
                    <td v-if="tableHeadersState.quantity" class="text-xs-right ii-number-cell" v-tariff-expired-hint>{{ props.item.quantity }}</td>
                    <td v-if="tableHeadersState.avgBuy" class="text-xs-right ii-number-cell" v-tariff-expired-hint>
                        <template>{{ props.item.avgBuy | number(false) }}</template>
                    </td>
                    <td v-if="tableHeadersState.currPrice" class="text-xs-right ii-number-cell" v-tariff-expired-hint>
                        <template>{{ props.item.currPrice | number(false) }}</template>
                    </td>
                    <td v-if="tableHeadersState.bcost" class="text-xs-right ii-number-cell" v-tariff-expired-hint>{{ props.item.bcost | amount(true) }}</td>
                    <td v-if="tableHeadersState.scost" class="text-xs-right ii-number-cell" v-tariff-expired-hint>{{ props.item.scost | amount(true) }}</td>
                    <td v-if="tableHeadersState.currCost" class="text-xs-right ii-number-cell" v-tariff-expired-hint>{{ props.item.currCost | amount(true) }}</td>
                    <td v-if="tableHeadersState.nominal" class="text-xs-right ii-number-cell" v-tariff-expired-hint>{{ props.item.nominal | amount(false, null, false) }}</td>
                    <td v-if="tableHeadersState.profitFromCoupons" :class="markupClasses(amount(props.item.profitFromCoupons))" v-tariff-expired-hint>
                        {{ props.item.profitFromCoupons | amount(true) }}
                    </td>
                    <td v-if="tableHeadersState.profitFromCouponsPercent" :class="markupClasses(Number(props.item.profitFromCouponsPercent))" v-tariff-expired-hint>
                        {{ props.item.profitFromCouponsPercent }}
                    </td>
                    <td v-if="tableHeadersState.exchangeProfit" :class="markupClasses(amount(props.item.exchangeProfit))"
                        v-tariff-expired-hint>{{props.item.exchangeProfit | amount(true) }}</td>
                    <td v-if="tableHeadersState.exchangeProfitPercent" :class="markupClasses(Number(props.item.exchangeProfitPercent))"
                        v-tariff-expired-hint>{{ props.item.exchangeProfitPercent }}</td>
                    <td v-if="tableHeadersState.rateProfit" :class="markupClasses(amount(props.item.rateProfit))"
                        v-tariff-expired-hint>{{ props.item.rateProfit | amount(true) }}</td>
                    <td v-if="tableHeadersState.rateProfitPercent" :class="markupClasses(Number(props.item.rateProfitPercent))"
                        v-tariff-expired-hint>{{ props.item.rateProfitPercent }}</td>
                    <td v-if="tableHeadersState.buyNkd" :class="markupClasses(amount(props.item.buyNkd))" v-tariff-expired-hint>{{ props.item.buyNkd | amount(true) }}</td>
                    <td v-if="tableHeadersState.sellNkd" :class="markupClasses(amount(props.item.sellNkd))" v-tariff-expired-hint>{{ props.item.sellNkd | amount(true) }}</td>
                    <td v-if="tableHeadersState.profit" :class="markupClasses(amount(props.item.profit))" v-tariff-expired-hint>{{ props.item.profit | amount(true) }}</td>
                    <td v-if="tableHeadersState.percProfit" :class="markupClasses(Number(props.item.percProfit))" v-tariff-expired-hint>{{ props.item.percProfit | number }}</td>
                    <td v-if="tableHeadersState.yearYield" :class="markupClasses(Number(props.item.yearYield))" v-tariff-expired-hint>{{ props.item.yearYield }}</td>
                    <td v-if="tableHeadersState.dailyPl" :class="markupClasses(amount(props.item.dailyPl))" v-tariff-expired-hint>{{ props.item.dailyPl | amount(true) }}</td>
                    <td v-if="tableHeadersState.dailyPlPercent" :class="markupClasses(Number(props.item.dailyPlPercent))" v-tariff-expired-hint>{{ props.item.dailyPlPercent }}</td>
                    <td v-if="tableHeadersState.summFee" class="text-xs-right ii-number-cell" v-tariff-expired-hint>{{ props.item.summFee | amount(true) }}</td>
                    <td v-if="tableHeadersState.percCurrShare" class="text-xs-right ii-number-cell">{{ props.item.percCurrShare | number }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu v-if="props.item.bond" transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile v-if="portfolioId" @click="openShareTradesDialog(props.item.bond.ticker)">
                                    <v-list-tile-title>
                                        Все сделки
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="shareNotes" @click="openEditShareNoteDialog(props.item.bond.ticker)">
                                    <v-list-tile-title>
                                        Заметка
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider v-if="portfolioId || shareNotes"></v-divider>
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
                                <v-list-tile @click="openTradeDialog(props.item, operation.COUPON)">
                                    <v-list-tile-title>
                                        Купон
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openTradeDialog(props.item, operation.AMORTIZATION)">
                                    <v-list-tile-title>
                                        Амортизация
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openTradeDialog(props.item, operation.REPAYMENT)">
                                    <v-list-tile-title>
                                        Погашение
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider></v-divider>
                                <v-list-tile @click="deleteAllTrades(props.item)">
                                    <v-list-tile-title>
                                        Удалить
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>

            <template #expand="props">
                <table class="ext-info" @click.stop v-tariff-expired-hint>
                    <tr>
                        <td>
                            <div class="ext-info__item">
                                Тикер
                                <span class="ext-info__ticker">
                                    <bond-link :ticker="props.item.bond.ticker"></bond-link>
                                </span><br>
                                В портфеле {{ props.item.ownedDays }} {{ props.item.ownedDays | declension("день", "дня", "дней")}}, c {{ props.item.firstBuy | date }}<br>
                                Дата погашения {{ props.item.bond.matdate }}<br>
                                Количество {{ props.item.quantity | number }} <span>{{ props.item.quantity | declension("облигация", "облигации", "облигации") }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Номинал покупки {{ props.item.nominal | amount(true) }} <span>{{ portfolioCurrency }}</span><br>
                                Дисконт {{ props.item.amortization | amount(true) }} <span>{{ props.item.bond.currency }}</span><br>
                                <template v-if="!props.item.bond.isRepaid">Купон {{ props.item.bond.couponvalue | amount(true) }}
                                    <span>{{ props.item.bond.currency }}</span></template>
                                <br>
                                <template v-if="!props.item.bond.isRepaid">След купон {{ props.item.bond.nextcoupon | date }}
                                    <span>{{ props.item.bond.currency }}</span></template>
                                <br>
                                <template v-if="props.item.bond.isRepaid">Статус Погашена</template>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Средняя цена {{ props.item.avgBuy | number }} <span>%</span><br>
                                Средняя цена {{ props.item.absoluteAvgPrice | amount(false, 2, false) }} <span>{{ props.item.bond.currency }}</span><br>
                                Средний номинал {{props.item.nominal | amount}} <span>{{ portfolioCurrency }}</span><br>
                                Текущая цена {{ props.item.currPrice | number }} <span>%</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="ext-info__item">
                                Прибыль от купонов {{ props.item.profitFromCoupons | amount }} <span>{{ portfolioCurrency }}</span><br>
                                Прибыль от купонов {{ props.item.profitFromCouponsPercent | number }} <span>%</span><br>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Прибыль по сделкам {{ props.item.exchangeProfit | amount }} <span>{{ portfolioCurrency }}</span><br>
                                Прибыль по сделкам {{ props.item.exchangeProfitPercent | number }} <span>%</span>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Курс.прибыль {{ props.item.rateProfit | amount }} <span>{{ portfolioCurrency }}</span><br>
                                Курс.прибыль {{ props.item.rateProfitPercent | number }} <span>%</span><br>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="ext-info__item">
                                <template v-if="!props.item.bond.isRepaid">НКД {{ props.item.bond.accruedint | amount(true) }}</template>
                                <br>
                                Выплаченный НКД {{ props.item.buyNkd | amount }} <span>{{ portfolioCurrency }}</span><br>
                                Полученный НКД {{ props.item.sellNkd | amount }} <span>{{ portfolioCurrency }}</span><br>
                                <template v-if="shareNotes && shareNotes[props.item.bond.ticker]">Заметка {{ shareNotes[props.item.bond.ticker] }}</template>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Доходность {{ props.item.yearYield | number }} <span>%</span><br>
                                P/L за день {{ props.item.dailyPl | amount }} <span>{{ portfolioCurrency }}</span><br>
                                P/L за день {{ props.item.dailyPlPercent | number }} <span>%</span><br>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Стоимость покупок {{ props.item.bcost | amount }} <span>{{ portfolioCurrency }}</span><br>
                                Стоимость продаж {{ props.item.scost | amount }} <span>{{ portfolioCurrency }}</span><br>
                                Комиссия {{ props.item.summFee | amount }} <span>{{ portfolioCurrency }}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </template>
        </v-data-table>
    `
})
export class BondTable extends UI {

    @Inject
    private tradeService: TradeService;
    @Inject
    private tablesService: TablesService;
    @Inject
    private portfolioService: PortfolioService;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    /** Идентификатор портфеля */
    @Prop({default: null, type: String, required: true})
    private portfolioId: string;
    /** Валюта просмотра информации */
    @Prop({required: true, type: String})
    private viewCurrency: string;
    /** Заметки по бумагам портфеля */
    @Prop({default: null, type: Object, required: false})
    private shareNotes: { [key: string]: string };
    /** Список заголовков таблицы */
    @Prop()
    private headers: TableHeader[];
    /** Список отображаемых строк */
    @Prop({default: [], required: true})
    private rows: BondPortfolioRow[];
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
    private filteredRows: BondPortfolioRow[] = [];
    /** Состояние столбцов таблицы */
    private tableHeadersState: TableHeadersState;
    /** Текущая операция */
    private operation = Operation;
    /** Перечисление типов таблиц */
    private TABLES_NAME = TABLES_NAME;
    /** Типы активов */
    private AssetType = AssetType;
    /** Паджинация для задания дефолтной сортировки */
    private pagination: Pagination = {
        descending: false,
        sortBy: "percCurrShare",
        rowsPerPage: -1
    };

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
    onFilterChange(): void {
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

    private async openShareTradesDialog(ticker: string): Promise<void> {
        await new ShareTradesDialog().show({trades: await this.tradeService.getShareTrades(this.portfolioId, ticker), ticker});
    }

    private async openTradeDialog(bondRow: BondPortfolioRow, operation: Operation): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: bondRow.bond,
            quantity: [Operation.COUPON, Operation.AMORTIZATION, Operation.REPAYMENT].indexOf(operation) !== -1 ? bondRow.quantity : null,
            operation,
            assetType: AssetType.BOND
        });
        if (result) {
            await this.reloadPortfolio(Number(this.portfolioId));
        }
    }

    /**
     * Обновляет заметки по бумага в портфеле
     * @param ticker тикер по которому редактируется заметка
     */
    private async openEditShareNoteDialog(ticker: string): Promise<void> {
        const data = await new EditShareNoteDialog().show({ticker, note: this.shareNotes[ticker]});
        if (data) {
            await this.editShareNote(data);
        }
    }

    @ShowProgress
    private async editShareNote(data: EditShareNoteDialogData): Promise<void> {
        await this.portfolioService.updateShareNotes(this.portfolioId, this.shareNotes, data);
        this.$snotify.info(`Заметка по бумаге ${data.ticker} была успешно сохранена`);
    }

    private async deleteAllTrades(bondRow: BondPortfolioRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге ${bondRow.bond.ticker} (${bondRow.quantity} шт.)?`);
        if (result === BtnReturn.YES) {
            await this.deleteAllTradesAndReloadData(bondRow);
        }
    }

    @ShowProgress
    private async deleteAllTradesAndReloadData(bondRow: BondPortfolioRow): Promise<void> {
        await this.tradeService.deleteAllTrades({
            assetType: AssetType.BOND.enumName,
            ticker: bondRow.bond.ticker,
            portfolioId: Number(this.portfolioId)
        });
        await this.reloadPortfolio(Number(this.portfolioId));
    }

    private amount(value: string): number {
        if (!value) {
            return 0.00;
        }
        const amount = new BigMoney(value);
        return amount.amount.toNumber();
    }

    private customSort(items: BondPortfolioRow[], index: string, isDesc: boolean): BondPortfolioRow[] {
        return SortUtils.bondSort(items, index, isDesc);
    }

    private customFilter(items: BondPortfolioRow[], searchString: string): BondPortfolioRow[] {
        let search = searchString;
        if (CommonUtils.isBlank(search)) {
            return items;
        }
        search = search.toLowerCase();
        return items.filter(row => {
            return row.bond && (row.bond.shortname.toLowerCase().includes(search) ||
                row.bond.ticker.toLowerCase().includes(search) ||
                row.bond.prevprice.includes(search) ||
                row.yearYield.includes(search));
        });
    }

    private expandRow(props: any): void {
        if (props.item.bond) {
            props.expanded = !props.expanded;
        }
    }

    private getHeaderText(header: TableHeader): string {
        return header.currency ? `${header.text} ${TradeUtils.getCurrencySymbol(this.portfolioCurrency)}` : header.text;
    }

    private markupClasses(amount: number): string[] {
        return TradeUtils.markupClasses(amount);
    }

    private get portfolioCurrency(): string {
        return TradeUtils.getCurrencySymbol(this.viewCurrency);
    }
}
