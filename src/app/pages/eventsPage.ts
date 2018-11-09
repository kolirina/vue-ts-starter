import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {EventService, ShareEvent} from "../services/eventService";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {Portfolio, TableHeader, TradeRow} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>

            <v-data-table :headers="headers" :items="events" item-key="id" :loading="loading" hide-actions>
                <template slot="items" slot-scope="props">
                    <tr>
                        <td>{{ props.item.label }}</td>
                        <td>{{ props.item.share.shortname }}</td>
                        <td>
                            <router-link v-if="props.item.type === 'DIVIDEND'" :to="{name: 'share-info', params: {ticker: props.item.share.ticker}}">
                                {{ props.item.share.ticker }}
                            </router-link>
                            <router-link v-if="props.item.type !== 'DIVIDEND'" :to="{name: 'bond-info', params: {isin: props.item.share.ticker}}">
                                {{ props.item.share.ticker }}
                            </router-link>
                        </td>
                        <td class="text-xs-center">{{ props.item.date | date }}</td>
                        <td class="text-xs-right">{{ props.item.period }}</td>
                        <td class="text-xs-right">{{ props.item.cleanAmount | amount(true) }}</td>
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
                        Добавьте свою первую сделку чтобы мы могли предложить вам события
                    </v-alert>
                </template>
            </v-data-table>
        </v-container>
    `
})
export class EventsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @Inject
    private eventService: EventService;
    /** Признак загрузки данных */
    private loading = false;
    /** События */
    private events: ShareEvent[] = [];
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

    private async loadEvents(): Promise<void> {
        this.loading = true;
        this.events = await this.eventService.getEvents(this.portfolio.id);
        this.loading = false;
    }

    private async openTradeDialog(event: ShareEvent): Promise<void> {
        const operation = Operation.valueByName(event.type);
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: event.share,
            operation,
            assetType: operation === Operation.DIVIDEND ? AssetType.STOCK : AssetType.BOND
        });
    }
}
