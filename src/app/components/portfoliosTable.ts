import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {PortfolioParams, PortfolioService} from "../services/portfolioService";
import {TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {BtnReturn} from "./dialogs/customDialog";
import {EmbeddedBlocksDialog} from "./dialogs/embeddedBlocksDialog";
import {PortfolioEditDialog} from "./dialogs/portfolioEditDialog";
import {SharePortfolioDialog} from "./dialogs/sharePortfolioDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="portfolios" item-key="id" hide-actions>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td>{{ props.item.name }}</td>
                    <td class="text-xs-center">
                        <v-icon color="gray" small v-if="props.item.professionalMode" title="Профессиональный режим в действии">fas fa-rocket</v-icon>
                        <v-icon color="gray" small v-if="props.item.access" title="Открыт публичный доступ к портфелю">fas fa-share-alt</v-icon>
                    </td>
                    <td class="text-xs-right">{{ props.item.fixFee }}</td>
                    <td class="text-xs-center">{{ props.item.viewCurrency }}</td>
                    <td class="text-xs-center">{{ props.item.accountType.description }}</td>
                    <td class="text-xs-center">{{ props.item.openDate }}</td>
                    <td class="justify-center layout px-0">
                        <v-btn icon class="mx-0" @click.stop="openDialogForEdit(props.item)">
                            <v-icon color="teal">edit</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-0" @click.stop="deletePortfolio(props.item)">
                            <v-icon color="pink">delete</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>

            <template slot="expand" slot-scope="props">
                <v-card flat>
                    <v-card-text>
                        <table>
                            <thead>
                            <tr>
                                <th style="width: 250px"></th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Время с момента открытия</td>
                                <td>{{ props.item.openDate }}</td>
                            </tr>
                            <tr>
                                <td>Брокер</td>
                                <td>{{props.item.broker}}</td>
                            </tr>
                            <tr>
                                <td>Настройка доступа</td>
                                <td>
                                    <v-btn dark color="primary" @click.native="openSharePortfolioDialog(props.item.id)" small>
                                        Настройка доступа
                                    </v-btn>
                                </td>
                            </tr>
                            <tr>
                                <td>Ссылка на публичный портфель</td>
                                <td><a :href="publicLink(props.item.id)">{{publicLink(props.item.id)}}</a></td>
                            </tr>
                            <tr>
                                <td>Ссылка информер-картинка горизонтальный</td>
                                <td><a :href="informerH(props.item.id)">{{informerH(props.item.id)}}</a></td>
                            </tr>
                            <tr>
                                <td>Ссылка информер-картинка вертикальный</td>
                                <td><a :href="informerV(props.item.id)">{{informerV(props.item.id)}}</a></td>
                            </tr>
                            <tr>
                                <td>Встраиваемые блоки</td>
                                <td>
                                    <v-btn dark color="primary" @click.stop="openEmbeddedDialog(props.item.id)" small>
                                        Получить код
                                    </v-btn>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </v-card-text>
                </v-card>
            </template>
        </v-data-table>
    `
})
export class PortfoliosTable extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    @Inject
    private portfolioService: PortfolioService;

    private headers: TableHeader[] = [
        {text: "Название", align: "left", value: "name"},
        {text: "", align: "center", value: "", sortable: false, width: "100"},
        {text: "Фикс. комиссия", align: "right", value: "fixFee", width: "50"},
        {text: "Валюта", align: "center", value: "viewCurrency"},
        {text: "Тип счета", align: "center", value: "accountType"},
        {text: "Дата открытия", align: "center", value: "openDate"},
        {text: "Меню", value: "", align: "center", width: "30", sortable: false}
    ];

    @Prop({default: [], required: true})
    private portfolios: PortfolioParams[];

    private async openDialogForEdit(portfolioParams: PortfolioParams): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router, portfolioParams});
    }

    private async deletePortfolio(portfolio: PortfolioParams): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы собираетесь удалить портфель. ${portfolio.name}
                                              Все сделки по акциям, облигациям и дивиденды,
                                              связанные с этим портфелем будут удалены.`);
        if (result === BtnReturn.YES) {
            await this.portfolioService.deletePortfolio(portfolio.id);
            await this.reloadPortfolios();
            this.$snotify.info("Портфель успешно удален");
        }
    }

    private publicLink(id: string): string {
        return `${window.location.protocol}//${window.location.host}/public-portfolio/${id}/?ref=${this.clientInfo.user.id}`;
    }

    private informerV(id: string): string {
        return `${window.location.protocol}//${window.location.host}/informer/v/${id}.png`;
    }

    private informerH(id: string): string {
        return `${window.location.protocol}//${window.location.host}/informer/h/${id}.png`;
    }

    private async openEmbeddedDialog(id: string): Promise<void> {
        await new EmbeddedBlocksDialog().show(id);
    }

    private async openSharePortfolioDialog(id: string): Promise<void> {
        await new SharePortfolioDialog().show({portfolioId: id, clientInfo: this.clientInfo});
    }
}
