import Component from "vue-class-component";
import {CustomDialog} from "./customDialog";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {Watch} from "vue-property-decorator";
import {Share} from "../../types/types";
import {Inject} from "typescript-ioc";
import {MarketService} from "../../services/marketService";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="500px">
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
                                <v-select :items="filteredShares" v-model="share"
                                          label="Тикер / Название компании" 
                                          item-text="ticker" 
                                          :loading="shareSearch"
                                          autocomplete
                                          :search-input.sync="searchQuery"></v-select>
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
                                            prepend-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="date" @input="$refs.dateMenu.save(date)"></v-date-picker>
                                </v-menu>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Цена" v-model="price"></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Количество" v-model="quantity" hint="указывается в штуках" persistent-hint></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Комиссия" v-model="fee"></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Заметка" v-model="note"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <small>*indicates required field</small>
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

    private assetTypes = AssetType.values();

    private assetType = AssetType.STOCK;

    private operation = Operation.BUY;

    private share: Share = null;

    private filteredShares: Share[] = [];

    private ticker: string = null;

    private date: Date = null;

    private price: number = null;

    private quantity: number = null;

    private fee: number = null;

    private note: number = null;

    private dateMenuValue = false;

    private shareSearch = false;

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

    @Watch("share")
    private shareSelect(share: Share): void {
        console.log('SELECT SHARE', share);
        this.searchQuery = null;
    }

    private cancel(): void {
        this.close();
    }

    private async addTrade(): Promise<void> {
        console.log('ADD', this.ticker, this.date);
        this.close(true);
    }
}