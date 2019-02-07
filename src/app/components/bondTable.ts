import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {PortfolioService} from "../services/portfolioService";
import {TableHeadersState, TablesService} from "../services/tablesService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {BondPortfolioRow, Portfolio, TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {BtnReturn} from "./dialogs/customDialog";
import {EditShareNoteDialog} from "./dialogs/editShareNoteDialog";
import {ShareTradesDialog} from "./dialogs/shareTradesDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="id" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td>
                        <v-icon class="data-table-cell" v-bind:class="{'data-table-cell-open': props.expanded}">play_arrow</v-icon>
                    </td>
                    <td v-if="tableHeadersState.company">{{ props.item.bond.shortname }}</td>
                    <td v-if="tableHeadersState.ticker">
                        <bond-link :ticker="props.item.bond.ticker"></bond-link>
                    </td>
                    <td v-if="tableHeadersState.quantity" class="text-xs-right ii-number-cell">{{props.item.quantity}}</td>
                    <td v-if="tableHeadersState.avgBuy" class="text-xs-right ii-number-cell">{{ props.item.avgBuy | number }}</td>
                    <td v-if="tableHeadersState.currPrice" class="text-xs-right ii-number-cell">{{ props.item.currPrice | number }}</td>
                    <td v-if="tableHeadersState.bCost" class="text-xs-right ii-number-cell">{{props.item.bcost | amount}}</td>
                    <td v-if="tableHeadersState.sCost" class="text-xs-right ii-number-cell">{{props.item.scost | amount}}</td>
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
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" color="primary" flat icon dark>
                                <v-icon color="primary" small>fas fa-bars</v-icon>
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
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.BUY)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                        Купить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.SELL)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-minus</v-icon>
                                        Продать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.COUPON)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Купон
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.AMORTIZATION)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-hourglass-half</v-icon>
                                        Амортизация
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.REPAYMENT)">
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

            <template slot="expand" slot-scope="props">
                <v-card flat>
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex :d-block="true">
                                    <span>ISIN:</span>{{ props.item.bond.isin }}
                                </v-flex>
                                <v-flex v-if="!props.item.bond.isRepaid">
                                    <span>След. купон:</span>{{ props.item.bond.nexcoupon | amount(true) }}
                                </v-flex>
                                <v-flex v-if="!props.item.bond.isRepaid">
                                    <span>Купон:</span>{{ props.item.bond.couponvalue | amount(true) }}
                                </v-flex>
                                <v-flex v-if="!props.item.bond.isRepaid">
                                    <span>НКД:</span>{{ props.item.bond.accruedint | amount(true) }}
                                </v-flex>
                                <v-flex v-if="props.item.bond.isRepaid">
                                    <span>Статус: Погашена</span>
                                </v-flex>
                                <v-flex>
                                    {{ 'Дата погашения:' + props.item.bond.matdate }}
                                </v-flex>
                                <v-flex>
                                    <span>Номинал покупки:</span>{{ props.item.nominal | amount(true) }}
                                </v-flex>
                                <v-flex>
                                    <span>Дисконт:</span>{{ props.item.bond.amortization | amount(true) }}
                                </v-flex>
                                <v-flex>
                                    {{ 'Вы держите бумагу в портфеле:' + props.item.ownedDays + ' дня, c ' + props.item.firstBuy }}
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                </v-card>
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
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    @Prop()
    private headers: TableHeader[];

    @Prop({default: [], required: true})
    private rows: BondPortfolioRow[];

    private tableHeadersState: TableHeadersState;

    private operation = Operation;

    created(): void {
        /** Установка состояния заголовков таблицы */
        this.setHeadersState();
    }

    @Watch("headers")
    onHeadersChange(): void {
        this.setHeadersState();
    }

    setHeadersState(): void {
        this.tableHeadersState = this.tablesService.getHeadersState(this.headers);
    }

    private async openShareTradesDialog(ticker: string): Promise<void> {
        await new ShareTradesDialog().show({trades: await this.tradeService.getShareTrades(this.portfolio.id, ticker), ticker});
    }

    private async openTradeDialog(bondRow: BondPortfolioRow, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: bondRow.bond,
            operation,
            assetType: AssetType.BOND
        });
    }

    /**
     * Обновляет заметки по бумага в портфеле
     * @param ticker тикер по которому редактируется заметка
     */
    private async openEditShareNoteDialog(ticker: string): Promise<void> {
        const result = await new EditShareNoteDialog().show({ticker, note: this.portfolio.portfolioParams.shareNotes[ticker]});
        if (result) {
            await this.portfolioService.updateShareNotes(this.portfolio, result);
            this.$snotify.info(`Заметка по бумаге ${ticker} была успешно сохранена`);
        }
    }

    private async deleteAllTrades(bondRow: BondPortfolioRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            await this.tradeService.deleteAllTrades({
                assetType: "BOND",
                ticker: bondRow.bond.ticker,
                portfolioId: this.portfolio.id
            });
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private amount(value: string): number {
        if (!value) {
            return 0.00;
        }
        const amount = new BigMoney(value);
        return amount.amount.toNumber();
    }
}
