import Component from "vue-class-component";
import {CustomDialog} from "./customDialog";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {Watch} from "vue-property-decorator";
import {Share, TradeData} from "../../types/types";
import {Inject} from "typescript-ioc";
import {MarketService} from "../../services/marketService";
import Decimal from "decimal.js";
import {BigMoney} from "../../types/bigMoney";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="700px">
            <v-card>
                <v-card-title>
                    <span class="headline">Добавление сделки</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6>
                                <v-select :items="assetTypes" v-model="assetType" label="Тип актива" item-text="description"></v-select>
                            </v-flex>

                            <v-flex xs12 sm6>
                                <v-select :items="assetType.operations" v-model="operation" label="Операция" item-text="description"></v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-select :items="filteredShares"
                                          :filter="customFilter"
                                          v-model="share"
                                          label="Тикер / Название компании"
                                          :loading="shareSearch"
                                          :no-data-text="notFoundLabel"
                                          autocomplete
                                          clearable
                                          cache-items
                                          required
                                          prepend-icon="fas fa-building"
                                          :search-input.sync="searchQuery">
                                    <template slot="selection" slot-scope="data">
                                        {{ shareLabelSelected(data.item) }}
                                    </template>
                                    <template slot="item" slot-scope="data">
                                        {{ shareLabelListItem(data.item) }}
                                    </template>
                                </v-select>
                            </v-flex>
                            <v-flex xs12>
                                <v-menu
                                        ref="dateMenu"
                                        :close-on-content-click="false"
                                        v-model="dateMenuValue"
                                        :nudge-right="40"
                                        :return-value.sync="date"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="date"
                                            label="Дата"
                                            required
                                            prepend-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="date" @input="$refs.dateMenu.save(date)"></v-date-picker>
                                </v-menu>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Цена" v-model="price" v-mask="priceMask" prepend-icon="fas fa-money-bill-alt"></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Количество" v-model="quantity" :hint="lotSizeHint" persistent-hint prepend-icon="fas fa-plus"></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Комиссия" v-model="fee"
                                              prepend-icon="fas fa-coins"
                                              hint="Для автоматического рассчета комиссии задайте значение в Настройках или введите значение суммарной комиссии"></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Заметка" v-model="note" :counter="160" prepend-icon="fas fa-sticky-note"></v-text-field>
                            </v-flex>
                        </v-layout>

                        <v-layout wrap>
                            <v-flex xs12 lg6>
                                <span class="body-2">Сумма сделки: </span><span v-if="total"><b class="title">{{ total }} {{ currency }}</b></span>
                            </v-flex>
                            <v-flex xs12 lg6>
                                <v-checkbox :label="keepMoneyLabel" v-model="keepMoney"></v-checkbox>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <small>* обозначает обязательные поля</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="cancel">Отмена</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="addTrade">Добавить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `,
    components: {CustomDialog}
})
export class AddTradeDialog extends CustomDialog<string, boolean> {

    @Inject
    private marketService: MarketService;

    $refs: {
        dateMenu: any
    };

    private notFoundLabel = 'Ничего не найдено';

    private assetTypes = AssetType.values();

    private assetType = AssetType.STOCK;

    private operation = Operation.BUY;

    private share: Share = null;

    private filteredShares: Share[] = [];

    private ticker: string = null;

    private date: Date = null;

    private price: string = null;

    private quantity: number = null;

    private fee: string = null;

    private note: string = null;

    private dateMenuValue = false;

    private shareSearch = false;

    private keepMoney = true;

    private currency = 'RUB';

    private priceMask = '999.99';

    private searchQuery: string = null;
    /** Текущий объект таймера */
    private currentTimer: number = null;

    private mounted(): void {
        console.log('ADD TRADE DIALOG', this.assetType, this.operation);
    }

    @Watch("assetType")
    private onAssetTypeChange(newValue: AssetType): void {
        this.operation = this.assetType.operations[0];
    }

    @Watch("searchQuery")
    private async onSearch(): Promise<void> {
        console.log('SEARCH', this.searchQuery);
        if (!this.searchQuery || this.searchQuery.length <= 2) {
            return;
        }
        clearTimeout(this.currentTimer);
        this.shareSearch = true;
        const delay = new Promise((resolve, reject) => {
            this.currentTimer = setTimeout(async () => {
                try {
                    this.filteredShares = await this.marketService.searchStocks(this.searchQuery);
                    this.shareSearch = false;
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });

        try {
            delay.then(() => {
                clearTimeout(this.currentTimer);
                this.shareSearch = false;
            });
        } catch (error) {
            clearTimeout(this.currentTimer);
            this.shareSearch = false;
            throw error;
        }
    }

    private get total(): string {
        if (!this.price || !this.quantity) {
            return '';
        }
        return new Decimal(this.price).mul(new Decimal(this.quantity)).toString();
    }

    private get keepMoneyLabel(): string {
        const toPort = "Зачислить деньги";
        const fromPort = "Списать деньги";
        return Operation.BUY === this.operation || Operation.WITHDRAW === this.operation || Operation.LOSS === this.operation ? fromPort : toPort;
    }

    private get lotSizeHint(): string {
        return 'указывается в штуках.' + (this.share ? ' 1 лот = ' + this.share.lotsize + ' шт.' : '');
    }

    @Watch("share")
    private shareSelect(): void {
        console.log('SELECT SHARE', this.share);
        this.price = new BigMoney(this.share.price).amount.toString();
        this.currency = this.share.currency;
    }

    private cancel(): void {
        this.close();
    }

    /**
     * Фильтрация происходит на сервере, дополнительно фильтровать не нужно
     * @param item
     * @param {string} queryText
     * @param {string} itemText
     * @returns {boolean}
     */
    private customFilter(item: any, queryText: string, itemText: string): boolean {
        return true;
    }

    private shareLabelSelected(share: Share): string {
        return `${share.ticker} (${share.shortname})`;
    }

    private shareLabelListItem(share: Share): string {
        if ((share as any) === this.notFoundLabel) {
            return this.notFoundLabel;
        }
        const price = new BigMoney(share.price);
        return `${share.ticker} (${share.shortname}), ${price.amount.toString()} ${price.currency}`;
    }

    private async addTrade(): Promise<void> {
        const trade: TradeData = {
            ticker: this.share.ticker,
            date: this.date,
            quantity: this.quantity,
            price: this.price,
            facevalue: null,
            nkd: null,
            perOne: false,
            fee: this.fee,
            note: this.note,
            keepMoney: true,
            moneyAmount: this.total,
            currency: this.currency
        };
        console.log('ADD', trade);
        this.close(true);
    }
}