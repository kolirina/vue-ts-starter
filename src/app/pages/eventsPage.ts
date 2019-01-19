import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {ConfirmDialog} from "../components/dialogs/confirmDialog";
import {BtnReturn} from "../components/dialogs/customDialog";
import {EventsAggregateInfo, EventService, ShareEvent} from "../services/eventService";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {Portfolio, TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <v-toolbar dark color="primary">
                <v-toolbar-title class="white--text">Новые события</v-toolbar-title>

                <v-spacer></v-spacer>
            </v-toolbar>

            <v-card>
                <v-card-text>
                    <div v-if="eventsAggregateInfo" class="eventsControls">
                        <v-btn color="primary" @click.native="confirmDeleteAllEvents" dark small>
                            Удалить все
                        </v-btn>
                        <v-btn color="primary" @click.native="executeAllEvents" dark small>
                            Исполнить все
                        </v-btn>
                        <div>
                            <v-btn color="primary" @click.native="executeAllEventsWithoutMoney" dark small>
                                Исполнить все без зачисления денег
                            </v-btn>
                            <v-tooltip :max-width="250" top>
                                <i slot="activator" class="far fa-question-circle"></i>
                                <span>
                                    Полезно, если вы хотите быстро учесть все начисления в доходности портфеля, а текущий баланс укажете самостоятельно.
                                </span>
                            </v-tooltip>
                        </div>
                    </div>

                    <div class="eventsAggregateInfo" v-if="eventsAggregateInfo">
                        <span class="item-block">
                            <span class="eventLegend dividend"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Дивиденды {{ eventsAggregateInfo.totalDividendsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend coupon"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Купоны {{ eventsAggregateInfo.totalCouponsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend amortization"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Амортизация {{ eventsAggregateInfo.totalAmortizationsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend repayment"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Поагешния {{ eventsAggregateInfo.totalRepaymentsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend custom"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Всего выплат {{ eventsAggregateInfo.totalAmount | number }} </span>
                        </span>
                    </div>

                    <v-data-table :headers="headers" :items="events" item-key="id" :loading="loading" hide-actions>
                        <template slot="items" slot-scope="props">
                            <tr>
                                <td>{{ props.item.label }}</td>
                                <td>{{ props.item.share.shortname }}</td>
                                <td>
                                    <stock-link v-if="props.item.type === 'DIVIDEND'" :ticker="props.item.share.ticker"></stock-link>

                                    <bond-link v-if="props.item.type !== 'DIVIDEND'" :ticker="props.item.share.ticker"></bond-link>
                                </td>
                                <td class="text-xs-center">{{ props.item.date | date }}</td>
                                <td class="text-xs-right">{{ props.item.period }}</td>
                                <td class="text-xs-right ii-number-cell">{{ props.item.cleanAmount | amount(true) }}</td>
                                <td class="justify-center layout px-0">
                                    <v-btn color="primary" @click="openTradeDialog(props.item)" flat icon dark>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                    </v-btn>
                                    <v-btn color="primary" flat icon dark>
                                        <v-icon color="primary" small>fas fa-trash-alt</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </template>

                        <template slot="no-data">
                            <v-alert :value="true" color="info" icon="info">
                                {{ emptyTableText }}
                            </v-alert>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class EventsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @Inject
    private eventService: EventService;
    /** Признак загрузки данных */
    private loading = false;
    /** События */
    private events: ShareEvent[] = [];
    private eventsAggregateInfo: EventsAggregateInfo = null;
    /** Зголовки таблицы */
    private headers: TableHeader[] = [
        {text: "Событие", align: "left", value: "label", width: "100"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Тикер/ISIN", align: "left", value: "ticker", width: "100"},
        {text: "Дата выплаты", align: "center", value: "date", width: "50"},
        {text: "Период", align: "center", value: "period", sortable: false, width: "100"},
        {text: "Начислено", align: "right", value: "cleanAmount", width: "120"},
        {text: "Действия", value: "", align: "center", width: "30", sortable: false}

    ];

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadEvents();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadEvents();
    }

    private async loadEvents(): Promise<void> {
        this.loading = true;
        const eventsResponse = await this.eventService.getEvents(this.portfolio.id);
        this.events = eventsResponse.events;
        this.eventsAggregateInfo = eventsResponse.eventsAggregateInfo;
        this.loading = false;
    }

    private async openTradeDialog(event: ShareEvent): Promise<void> {
        const operation = Operation.valueByName(event.type);
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: event.share,
            operation,
            assetType: operation === Operation.DIVIDEND ? AssetType.STOCK : AssetType.BOND
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async confirmDeleteAllEvents(): Promise<void> {
        const result = await new ConfirmDialog().show("Вы уверены что хотите удалить все начисления?");
        if (result === BtnReturn.YES) {
            await this.eventService.deleteAllEvents(this.portfolio.id);
            await this.loadEvents();
            this.$snotify.info("Начисления успешно удалены");
        }
    }

    private async executeAllEventsWithoutMoney(): Promise<void> {
        await this.eventService.executeAllEvents(this.portfolio.id, false);
        await this.loadEvents();
        this.$snotify.info("Начисления успешно исполнены");
    }

    private async executeAllEvents(): Promise<void> {
        await this.eventService.executeAllEvents(this.portfolio.id, true);
        await this.loadEvents();
        this.$snotify.info("Начисления успешно исполнены");
    }

    private get emptyTableText(): string {
        return this.portfolio.overview.totalTradesCount !== 0 ? "Новых событий по вашим бумагам еще не появилось" :
            "Добавьте свою первую сделку чтобы мы могли предложить вам события";
    }
}
