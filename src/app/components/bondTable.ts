import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {PortfolioService} from "../services/portfolioService";
import {TABLE_HEADERS, TableHeadersState, TABLES_NAME, TablesService} from "../services/tablesService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {BondPortfolioRow, Portfolio, TableHeader} from "../types/types";
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
        <v-data-table class="data-table" :headers="headers" :items="filteredRows" item-key="bond.id"
                      :search="search" :custom-sort="customSort" :custom-filter="customFilter" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #headerCell="props">
                <v-tooltip v-if="props.header.tooltip" content-class="custom-tooltip-wrap" bottom>
                    <template #activator="{ on }">
                        <span>
                            {{ props.header.text }}
                        </span>
                        <sup class="custom-tooltip" v-on="on">
                            <v-icon>fas fa-info-circle</v-icon>
                        </sup>
                    </template>
                    <span>
                      {{ props.header.tooltip }}
                    </span>
                </v-tooltip>
                <span v-else>
                    {{ props.header.text }}
                </span>
            </template>
            <template #items="props">
                <tr :class="['selectable', {'bold-row': !props.item.bond}]" @dblclick="props.expanded = !props.expanded">
                    <td>
                        <span v-if="props.item.bond" @click="props.expanded = !props.expanded"
                              :class="{'data-table-cell-open': props.expanded, 'path': true, 'data-table-cell': true}"></span>
                    </td>
                    <td v-if="tableHeadersState.company" class="text-xs-left">
                        <span v-if="props.item.bond">{{ props.item.bond.shortname }}</span>
                    </td>
                    <td v-if="tableHeadersState.ticker" class="text-xs-left">
                        <bond-link v-if="props.item.bond" :ticker="props.item.bond.ticker"></bond-link>
                    </td>
                    <td v-if="tableHeadersState.quantity" class="text-xs-right ii-number-cell">{{props.item.quantity}}</td>
                    <td v-if="tableHeadersState.avgBuy" class="text-xs-right ii-number-cell">{{ props.item.avgBuy | number }}</td>
                    <td v-if="tableHeadersState.currPrice" class="text-xs-right ii-number-cell">{{ props.item.currPrice | number }}</td>
                    <td v-if="tableHeadersState.bcost" class="text-xs-right ii-number-cell">{{props.item.bcost | amount}}</td>
                    <td v-if="tableHeadersState.scost" class="text-xs-right ii-number-cell">{{props.item.scost | amount}}</td>
                    <td v-if="tableHeadersState.currCost" class="text-xs-right ii-number-cell">{{ props.item.currCost | amount(true) }}</td>
                    <td v-if="tableHeadersState.nominal" class="text-xs-right ii-number-cell">{{props.item.nominal | amount}}</td>
                    <td v-if="tableHeadersState.profitFromCoupons" class="text-xs-right ii-number-cell">{{props.item.profitFromCoupons | amount}}</td>
                    <td v-if="tableHeadersState.profitFromCouponsPercent" class="text-xs-right ii-number-cell">{{props.item.profitFromCouponsPercent}}</td>
                    <td v-if="tableHeadersState.exchangeProfit" class="text-xs-right ii-number-cell">{{props.item.exchangeProfit | amount}}</td>
                    <td v-if="tableHeadersState.exchangeProfitPercent" class="text-xs-right ii-number-cell">{{props.item.exchangeProfitPercent}}</td>
                    <td v-if="tableHeadersState.rateProfit" class="text-xs-right ii-number-cell">{{props.item.rateProfit | amount}}</td>
                    <td v-if="tableHeadersState.rateProfitPercent" class="text-xs-right ii-number-cell">{{props.item.rateProfitPercent}}</td>
                    <td v-if="tableHeadersState.buyNkd" class="text-xs-right ii-number-cell">{{props.item.buyNkd | amount}}</td>
                    <td v-if="tableHeadersState.sellNkd" class="text-xs-right ii-number-cell">{{props.item.sellNkd | amount}}</td>
                    <td v-if="tableHeadersState.profit" :class="[( amount(props.item.profit) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                        {{ props.item.profit | amount(true) }}
                    </td>
                    <td v-if="tableHeadersState.percProfit"
                        :class="[( Number(props.item.percProfit) >= 0 ) ? 'ii--green-markup' :
                        'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                        {{ props.item.percProfit | number }}
                    </td>
                    <td v-if="tableHeadersState.yearYield" class="text-xs-right ii-number-cell">{{props.item.yearYield}}</td>
                    <td v-if="tableHeadersState.dailyPl" class="text-xs-right ii-number-cell">{{props.item.dailyPl | amount}}</td>
                    <td v-if="tableHeadersState.dailyPlPercent" class="text-xs-right ii-number-cell">{{props.item.dailyPlPercent}}</td>
                    <td v-if="tableHeadersState.summFee" class="text-xs-right ii-number-cell">{{props.item.summFee | amount}}</td>
                    <td v-if="tableHeadersState.percCurrShare" class="text-xs-right ii-number-cell">{{ props.item.percCurrShare | number }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu v-if="props.item.bond" transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click="openShareTradesDialog(props.item.bond.ticker)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-list-alt</v-icon>
                                        Все сделки
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openEditShareNoteDialog(props.item.bond.ticker)">
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
                                <v-list-tile @click="openTradeDialog(props.item, operation.COUPON)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Купон
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openTradeDialog(props.item, operation.AMORTIZATION)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-hourglass-half</v-icon>
                                        Амортизация
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="openTradeDialog(props.item, operation.REPAYMENT)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-recycle</v-icon>
                                        Погашение
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
                <!-- todo вывести значения
                <table class="ext-info">
                    <tr>
                        <td>
                            <div class="ext-info__item">
                                В портфеле {{ props.item.ownedDays }} {{ props.item.ownedDays | declension("день", "дня", "дней")}}, c {{ props.item.firstBuy | date }}<br>
                                Дата погашения - {{ props.item.bond.matdate }}<br>
                                Количество - 22
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Номинал покупки - {{ props.item.nominal | amount(true) }}<br>
                                Дисконт - {{ props.item.bond.amortization | amount(true) }}<br>
                                Купон - {{ props.item.bond.couponvalue | amount(true) }}<br>
                                След купон - {{ props.item.bond.nextcoupon | date }}
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Средняя цена - 122 442 <span>RUB</span><br>
                                Средний номинал - 5 <span>RUB</span><br>
                                Текущая цена - 0 <span>RUB</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="ext-info__item">
                                Прибыль от купонов - 47 777 <span>RUB</span><br>
                                Прибыль от купонов - 47 <span>%</span><br>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Прибыль по сделкам - 47 777 <span>RUB</span><br>
                                Прибыль по сделкам - 47 <span>%</span>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Курс.прибыль - 2 248.172 <span>RUB</span><br>
                                Курс.прибыль - 1.31 <span>%</span><br>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="ext-info__item">
                                НКД - {{ props.item.bond.accruedint | amount(true) }}<br>
                                Выплаченный НКД - 16 788,648 <span>RUB</span><br>
                                Полученный НКД - 16 788,648 <span>RUB</span>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Доходность - 1.31 <span>%</span><br>
                                P/L за день - 2 248.172 <span>RUB</span><br>
                                P/L за день - 1.31 <span>%</span><br>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Стоимость покупок - 122 442 <span>RUB</span><br>
                                Стоимость продаж - 0 <span>RUB</span><br>
                                Коммиссия - 834 <span>RUB</span>
                            </div>
                        </td>
                    </tr>
                </table>
                -->
                <table-extended-info :headers="headers" :table-name="TABLES_NAME.BOND"
                                     :asset="AssetType.BOND" :row-item="props.item" :ticker="props.item.bond.ticker">
                    <div class="extended-info__cell label">Время нахождения в портфеле</div>
                    <div class="extended-info__cell">
                        {{ props.item.ownedDays }} {{ props.item.ownedDays | declension("день", "дня", "дней")}}, c {{ props.item.firstBuy | date }}
                    </div>

                    <div v-if="!props.item.bond.isRepaid" class="extended-info__cell label">След. купон:</div>
                    <div v-if="!props.item.bond.isRepaid" class="extended-info__cell">{{ props.item.bond.nextcoupon | date }}</div>

                    <div v-if="!props.item.bond.isRepaid" class="extended-info__cell label">Купон</div>
                    <div v-if="!props.item.bond.isRepaid" class="extended-info__cell">{{ props.item.bond.couponvalue | amount(true) }}</div>

                    <div v-if="!props.item.bond.isRepaid" class="extended-info__cell label">НКД</div>
                    <div v-if="!props.item.bond.isRepaid" class="extended-info__cell">{{ props.item.bond.accruedint | amount(true) }}</div>

                    <div v-if="props.item.bond.isRepaid" class="extended-info__cell label">Статус</div>
                    <div v-if="props.item.bond.isRepaid" class="extended-info__cell">Погашена</div>

                    <div class="extended-info__cell label">Дата погашения</div>
                    <div class="extended-info__cell">{{ props.item.bond.matdate }}</div>

                    <div class="extended-info__cell label">Номинал покупки</div>
                    <div class="extended-info__cell">{{ props.item.nominal | amount(true) }}</div>

                    <div class="extended-info__cell label">Дисконт</div>
                    <div class="extended-info__cell">{{ props.item.bond.amortization | amount(true) }}</div>
                </table-extended-info>
            </template>
        </v-data-table>
    `,
    components: {TableExtendedInfo}
})
export class BondTable extends UI {

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

    @ShowProgress
    private async openShareTradesDialog(ticker: string): Promise<void> {
        new ShareTradesDialog().show({trades: await this.tradeService.getShareTrades(this.portfolio.id, ticker), ticker});
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
            await this.reloadPortfolio(this.portfolio.id);
        }
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

    private async deleteAllTrades(bondRow: BondPortfolioRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            await this.deleteAllTradesAndReloadData(bondRow);
        }
    }

    @ShowProgress
    private async deleteAllTradesAndReloadData(bondRow: BondPortfolioRow): Promise<void> {
        await this.tradeService.deleteAllTrades({
            assetType: AssetType.BOND.enumName,
            ticker: bondRow.bond.ticker,
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

    private customSort(items: BondPortfolioRow[], index: string, isDesc: boolean): BondPortfolioRow[] {
        items.sort((a: BondPortfolioRow, b: BondPortfolioRow): number => {
            if (!CommonUtils.exists(a.bond)) {
                return 1;
            }
            if (!CommonUtils.exists(b.bond)) {
                return -1;
            }
            if (index === TABLE_HEADERS.TICKER) {
                if (!isDesc) {
                    return a.bond.ticker.localeCompare(b.bond.ticker);
                } else {
                    return b.bond.ticker.localeCompare(a.bond.ticker);
                }
            } else if (index === TABLE_HEADERS.COMPANY) {
                if (!isDesc) {
                    return a.bond.shortname.localeCompare(b.bond.shortname);
                } else {
                    return b.bond.shortname.localeCompare(a.bond.shortname);
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

    private customFilter(items: BondPortfolioRow[], search: string): BondPortfolioRow[] {
        if (CommonUtils.isBlank(search)) {
            return items;
        }
        search = search.toLowerCase();
        return items.filter(row => {
            return row.bond && (row.bond.shortname.toLowerCase().includes(search) ||
                row.bond.ticker.toLowerCase().includes(search) ||
                row.bond.price.includes(search) ||
                row.yearYield.includes(search));
        });
    }
}
