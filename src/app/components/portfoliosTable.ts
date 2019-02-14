import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {PortfolioParams, PortfolioService} from "../services/portfolioService";
import {EventType} from "../types/eventType";
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
                <tr class="selectable">
                    <td>
                        <v-icon @click="props.expanded = !props.expanded" class="data-table-cell" v-bind:class="{'data-table-cell-open': props.expanded}">play_arrow</v-icon>
                    </td>
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
                        <v-btn icon class="mx-0" @click.stop="clonePortfolio(props.item.id)">
                            <v-icon color="blue">far fa-clone</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>

            <template slot="expand" slot-scope="props">
                <v-card flat>
                    <v-card-text>
                        <table>
                            <tbody>
                            <tr>
                                <td>Профессиональный режим</td>
                                <td style="display: flex;align-items: center;">
                                    <v-tooltip top style="height: 30px;">
                                        <v-checkbox slot="activator" label="Профессиональный режим"
                                                    @change="onProfessionalModeChange(props.item)"
                                                    v-model="props.item.professionalMode"></v-checkbox>
                                        <span>
                                            Профессиональный режим включает дополнительные возможности, необходимые опытным инвесторам:
                                            <ul>
                                                <li>возможность уходить в минус по деньгам (маржинальное кредитование)</li>
                                                <li>возможность открытия коротких позиций</li>
                                                <li>возможность учета времени заключения сделки</li>
                                            </ul>
                                        </span>
                                    </v-tooltip>
                                </td>
                            </tr>
                            <tr>
                                <td>Время с момента открытия</td>
                                <td>{{ props.item.openDate }}</td>
                            </tr>
                            <tr>
                                <td>Брокер</td>
                                <td>{{props.item.brokerName}}</td>
                            </tr>
                            <tr>
                                <td>Настройка доступа</td>
                                <td>
                                    <v-btn dark color="primary" @click.native="openSharePortfolioDialog(props.item)" small>
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
        {text: "", align: "left", ghost: true, sortable: false, value: "", active: true},
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

    private async clonePortfolio(id: string): Promise<void> {
        await this.portfolioService.createPortfolioCopy(id);
        this.$snotify.info("Копия портфеля успешно создана");
        UI.emit(EventType.PORTFOLIO_CREATED);
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

    private async openSharePortfolioDialog(portfolio: PortfolioParams): Promise<void> {
        await new SharePortfolioDialog().show({portfolio: portfolio, clientInfo: this.clientInfo});
    }

    private async onProfessionalModeChange(portfolio: PortfolioParams): Promise<void> {
        const result = await this.portfolioService.updatePortfolio(portfolio);
        this.$snotify.info(`Профессиональный режим для портфеля ${result.professionalMode ? "включен" : "выключен"}`);
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
    }
}
