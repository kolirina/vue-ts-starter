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
import {UI} from "../app/ui";
import {PortfolioService} from "../services/portfolioService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
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
        <v-data-table :headers="headers" :items="rows" item-key="id" :loading="loading" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td><span>{{ props.item.stock.shortname }}</span> <span>{{ props.item.stock.change }}%</span>
                    </td>
                    <td>
                        <stock-link :ticker="props.item.stock.ticker"></stock-link>
                    </td>
                    <td class="text-xs-right">{{ props.item.avgBuy | amount }}</td>
                    <td class="text-xs-right">{{ props.item.currPrice| amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.currCost| amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.profit| amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.percProfit | number }}</td>
                    <td class="text-xs-right">{{ props.item.percCurrShare | number }}</td>
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
    private portfolioService: PortfolioService;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    private operation = Operation;

    private headers: TableHeader[] = [
        {text: "Компания", align: "left", sortable: false, value: "company"},
        {text: "Тикер", align: "left", value: "ticker"},
        {text: "Ср. цена", align: "right", value: "avgBuy"},
        {text: "Тек. цена", align: "right", value: "currPrice"},
        {text: "Тек. стоимость", align: "right", value: "currCost", sortable: false},
        {text: "Прибыль", align: "right", value: "profit", sortable: false},
        {text: "Прибыль, %", align: "right", value: "percProfit"},
        {text: "Тек. доля", align: "right", value: "percCurrShare"},
        {text: "Действия", align: "center", value: "actions", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private rows: StockPortfolioRow[];

    @Prop({default: false})
    private loading: boolean;

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
}
