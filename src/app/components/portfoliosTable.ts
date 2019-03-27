import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {DisableConcurrentExecution} from "../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ClientInfo} from "../services/clientService";
import {PortfolioParams, PortfolioService} from "../services/portfolioService";
import {EventType} from "../types/eventType";
import {Portfolio, TableHeader} from "../types/types";
import {SortUtils} from "../utils/sortUtils";
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
        <v-data-table :headers="headers" :items="portfolios" item-key="id" :custom-sort="customSort" hide-actions>
            <template #items="props">
                <tr class="selectable" @dblclick="props.expanded = !props.expanded">
                    <td>
                        <span @click="props.expanded = !props.expanded" class="data-table-cell" :class="{'data-table-cell-open': props.expanded, 'path': true}"></span>
                    </td>
                    <td>{{ props.item.name }}</td>
                    <td class="text-xs-center">
                        <v-icon color="gray" small v-if="props.item.professionalMode" title="Профессиональный режим в действии">fas fa-rocket</v-icon>
                        <v-icon color="gray" small v-if="props.item.access" title="Открыт публичный доступ к портфелю">fas fa-share-alt</v-icon>
                    </td>
                    <td class="text-xs-right">{{ props.item.fixFee }}&nbsp;<span class="second-value">%</span></td>
                    <td class="text-xs-center">{{ props.item.viewCurrency }}</td>
                    <td class="text-xs-center">{{ props.item.accountType.description }}</td>
                    <td class="text-xs-center">{{ props.item.openDate }}</td>
                    <td class="justify-center layout px-0">
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click.stop="openDialogForEdit(props.item)">
                                    <v-list-tile-title>
                                        Редактировать портфель
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="deletePortfolio(props.item)">
                                    <v-list-tile-title>
                                        Удалить портфель
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="clonePortfolio(props.item.id)">
                                    <v-list-tile-title>
                                        Копировать портфель
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>

            <template #expand="props">
                <v-card flat>
                    <v-card-text>
                        <div class="extended-info one-column">
                            <div class="extended-info__cell label">Профессиональный режим</div>
                            <div class="extended-info__cell">
                                <v-tooltip content-class="custom-tooltip-wrap" top>
                                    <v-checkbox slot="activator" label="Профессиональный режим"
                                                @change="onProfessionalModeChange(props.item)"
                                                v-model="props.item.professionalMode" hide-details></v-checkbox>
                                    <span>
                                        Профессиональный режим включает дополнительные возможности, необходимые опытным инвесторам:
                                        <ul>
                                            <li>возможность уходить в минус по деньгам (маржинальное кредитование)</li>
                                            <li>возможность открытия коротких позиций</li>
                                            <li>возможность учета времени заключения сделки</li>
                                        </ul>
                                    </span>
                                </v-tooltip>
                            </div>

                            <div class="extended-info__cell label">Время с момента открытия</div>
                            <div class="extended-info__cell">{{ props.item.openDate }}</div>

                            <div v-if="props.item.brokerName" class="extended-info__cell label">Брокер</div>
                            <div v-if="props.item.brokerName" class="extended-info__cell">{{props.item.brokerName}}</div>

                            <div class="extended-info__cell label">Настройка доступа</div>
                            <div class="extended-info__cell">
                                <v-btn dark color="primary" @click.native="openSharePortfolioDialog(props.item)" small>
                                    Настройка доступа
                                </v-btn>
                            </div>

                            <div class="extended-info__cell label">Ссылка на публичный портфель</div>
                            <div class="extended-info__cell"><a :href="publicLink(props.item.id)">{{publicLink(props.item.id)}}</a></div>

                            <div class="extended-info__cell label">Ссылка информер-картинка горизонтальный</div>
                            <div class="extended-info__cell"><a :href="informerH(props.item.id)">{{informerH(props.item.id)}}</a></div>

                            <div class="extended-info__cell label">Ссылка информер-картинка вертикальный</div>
                            <div class="extended-info__cell"><a :href="informerV(props.item.id)">{{informerV(props.item.id)}}</a></div>

                            <div class="extended-info__cell label">Встраиваемые блоки</div>
                            <div class="extended-info__cell">
                                <v-btn dark color="primary" @click.stop="openEmbeddedDialog(props.item.id)" small>
                                    Получить код
                                </v-btn>
                            </div>
                        </div>
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
    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;
    @Inject
    private portfolioService: PortfolioService;

    private headers: TableHeader[] = [
        {text: "", align: "left", ghost: true, sortable: false, value: "", active: true},
        {text: "Название", align: "left", value: "name"},
        {text: "", align: "center", value: "", sortable: false, width: "100"},
        {text: "Фикс. комиссия", align: "right", value: "fixFee", width: "50"},
        {text: "Валюта", align: "center", value: "viewCurrency"},
        {text: "Тип счета", align: "center", value: "accountType.description"},
        {text: "Дата открытия", align: "center", value: "openDate"},
        {text: "", value: "", align: "center", width: "25", sortable: false}
    ];

    @Prop({default: [], required: true})
    private portfolios: PortfolioParams[];

    private async openDialogForEdit(portfolioParams: PortfolioParams): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router, portfolioParams});
    }

    private async deletePortfolio(portfolio: PortfolioParams): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы собираетесь удалить портфель ${portfolio.name}.
                                              Все сделки по акциям, облигациям и дивиденды,
                                              связанные с этим портфелем будут удалены.`);
        if (result === BtnReturn.YES) {
            await this.deletePortfolioAndShowMessage(portfolio.id);
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async deletePortfolioAndShowMessage(id: string): Promise<void> {
        await this.portfolioService.deletePortfolio(id);
        // запоминаем текущий портфель, иначе ниже они может быть обновлен
        const currentPortfolioId = this.clientInfo.user.currentPortfolioId;
        await this.reloadPortfolios();
        // нужно обновлять данные только если удаляемый портфель был выбран текущим и соответственно теперь выбран другой
        if (id === currentPortfolioId) {
            // могли удалить текущий портфель, надо выставить портфель по умолчанию
            await this.setCurrentPortfolio(this.clientInfo.user.portfolios[0].id);
        }
        this.$snotify.info("Портфель успешно удален");
    }

    @ShowProgress
    @DisableConcurrentExecution
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

    @ShowProgress
    private async onProfessionalModeChange(portfolio: PortfolioParams): Promise<void> {
        const result = await this.portfolioService.updatePortfolio(portfolio);
        this.$snotify.info(`Профессиональный режим для портфеля ${result.professionalMode ? "включен" : "выключен"}`);
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
    }

    private customSort(items: PortfolioParams[], index: string, isDesc: boolean): PortfolioParams[] {
        items.sort((a: PortfolioParams, b: PortfolioParams): number => {
            const first = (a as any)[index];
            const second = (b as any)[index];
            if (!isDesc) {
                const result = SortUtils.compareValues(first, second) * -1;
                return result === 0 ? Number(b.id) - Number(a.id) : result;
            } else {
                const result = SortUtils.compareValues(first, second);
                return result === 0 ? Number(a.id) - Number(b.id) : result;
            }
        });
        return items;
    }
}
