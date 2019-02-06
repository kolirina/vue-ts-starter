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
import {PortfolioService} from "../services/portfolioService";
import {TablesService, TableHeadersState, TABLES_NAME} from "../services/tablesService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {Portfolio, StockPortfolioRow, TableHeader} from "../types/types";
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
                    <td v-if="tableHeadersState.company">
                        <span>{{ props.item.stock.shortname }}</span>&nbsp;
                        <span :class="[(props.item.stock.change >= 0) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell']">{{ props.item.stock.change }}&nbsp;%</span>
                    </td>
                    <td v-if="tableHeadersState.ticker" class="text-xs-right ii-number-cell"><stock-link :ticker="props.item.stock.ticker"></stock-link></td>
                    <td v-if="tableHeadersState.quantity" class="text-xs-right ii-number-cell">{{props.item.quantity}}</td>
                    <td v-if="tableHeadersState.avgBuy" class="text-xs-right ii-number-cell">{{ props.item.avgBuy | amount }}</td>
                    <td v-if="tableHeadersState.currPrice" class="text-xs-right ii-number-cell">{{ props.item.currPrice| amount(true) }}</td>
                    <td v-if="tableHeadersState.bCost" class="text-xs-right ii-number-cell">{{ props.item.bcost | amount }}</td>
                    <td v-if="tableHeadersState.sCost" class="text-xs-right ii-number-cell">{{ props.item.scost | amount }}</td>
                    <td v-if="tableHeadersState.currCost" class="text-xs-right ii-number-cell" >{{ props.item.currCost| amount(true) }}</td>
                    <td v-if="tableHeadersState.profitFromDividends" class="text-xs-right ii-number-cell">{{ props.item.profitFromDividends | amount }}</td>
                    <td v-if="tableHeadersState.profitFromDividendsPercent" class="text-xs-right ii-number-cell">{{ props.item.profitFromDividendsPercent }}</td>
                    <td v-if="tableHeadersState.rateProfit" class="text-xs-right ii-number-cell">{{ props.item.rateProfit | amount }}</td>
                    <td v-if="tableHeadersState.rateProfitPercent" class="text-xs-right ii-number-cell">{{ props.item.rateProfitPercent }}</td>
                    <td v-if="tableHeadersState.exchangeProfit" class="text-xs-right ii-number-cell">{{ props.item.exchangeProfit | amount }}</td>
                    <td v-if="tableHeadersState.exchangeProfitPercent" class="text-xs-right ii-number-cell">{{ props.item.exchangeProfitPercent }}</td>
                    <td v-if="tableHeadersState.profit" :class="[( amount(props.item.profit) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                        {{ props.item.profit| amount(true) }}
                    </td>
                    <td v-if="tableHeadersState.percProfit" :class="[( Number(props.item.percProfit) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                        {{ props.item.percProfit | number }}
                    </td>
                    <td v-if="tableHeadersState.yearYield" class="text-xs-right ii-number-cell">{{ props.item.yearYield }}</td>
                    <td v-if="tableHeadersState.dailyPl" class="text-xs-right ii-number-cell">{{ props.item.dailyP | amount }}</td>
                    <td v-if="tableHeadersState.dailyPlPercent" class="text-xs-right ii-number-cell">{{ props.item.dailyPlPercent }}</td>
                    <td v-if="tableHeadersState.summFee" class="text-xs-right ii-number-cell">{{ props.item.summFee | amount }}</td>
                    <td v-if="tableHeadersState.percCurrShare" class="text-xs-right ii-number-cell">{{ props.item.percCurrShare | number }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" color="primary" flat icon dark>
                                <v-icon color="primary" small>fas fa-bars</v-icon>
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
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.DIVIDEND)">
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

            <template slot="expand" slot-scope="props">
                <v-card flat>
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex>
                                    {{ 'Вы держите акцию в портфеле:' + props.item.ownedDays + ' дня c, ' + props.item.firstBuy }}
                                </v-flex>
                                <v-flex>
                                    {{ 'Количество полных лотов ' + props.item.lotCounts }}
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                </v-card>
            </template>
        </v-data-table>
    `
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

    private operation = Operation;

    @Prop()
    private headers: TableHeader[];

    @Prop({default: [], required: true})
    private rows: StockPortfolioRow[];

    private tableHeadersState:TableHeadersState;

    beforeMount(): void {
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

    private async openTradeDialog(stockRow: StockPortfolioRow, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: stockRow.stock,
            operation,
            assetType: AssetType.STOCK
        });
    }

    private async deleteAllTrades(stockRow: StockPortfolioRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            await this.tradeService.deleteAllTrades({
                assetType: "STOCK",
                ticker: stockRow.stock.ticker,
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
